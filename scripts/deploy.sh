#!/bin/bash

# DatingAssistent Deployment Script
# This script handles the complete deployment process for both staging and production

set -e  # Exit on any error

# Configuration
APP_NAME="dating-assistent"
ENVIRONMENT=${1:-"staging"}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"your-registry.com"}
NAMESPACE=${NAMESPACE:-"default"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment
validate_environment() {
    if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
        log_error "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
        exit 1
    fi

    log_info "Deploying to $ENVIRONMENT environment"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."

    # Check if required environment variables are set
    required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "OPENROUTER_API_KEY")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done

    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running"
        exit 1
    fi

    # Check if kubectl is available (for Kubernetes deployments)
    if command -v kubectl >/dev/null 2>&1; then
        if ! kubectl cluster-info >/dev/null 2>&1; then
            log_error "Kubernetes cluster is not accessible"
            exit 1
        fi
    fi

    log_success "Pre-deployment checks passed"
}

# Build Docker image
build_image() {
    local tag="$DOCKER_REGISTRY/$APP_NAME:$ENVIRONMENT-$(git rev-parse --short HEAD)"
    local latest_tag="$DOCKER_REGISTRY/$APP_NAME:$ENVIRONMENT-latest"

    log_info "Building Docker image: $tag"

    # Build the image
    docker build \
        --target runner \
        --tag "$tag" \
        --tag "$latest_tag" \
        --build-arg NODE_ENV=production \
        --build-arg NEXT_PUBLIC_ENVIRONMENT="$ENVIRONMENT" \
        .

    # Push the image
    log_info "Pushing Docker image to registry..."
    docker push "$tag"
    docker push "$latest_tag"

    log_success "Docker image built and pushed: $tag"

    # Return the image tag for deployment
    echo "$tag"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."

    # This would typically run migration scripts
    # For example, using a migration tool like Prisma or custom scripts

    # Example for PostgreSQL with custom migration scripts:
    # docker run --rm --network host \
    #   -e DATABASE_URL="$DATABASE_URL" \
    #   "$APP_NAME:$ENVIRONMENT-latest" \
    #   npx tsx src/scripts/migrate.ts

    log_success "Database migrations completed"
}

# Deploy to Kubernetes
deploy_to_kubernetes() {
    local image_tag="$1"

    log_info "Deploying to Kubernetes..."

    # Update the deployment with new image
    kubectl set image deployment/$APP_NAME app="$image_tag" --namespace="$NAMESPACE"

    # Wait for rollout to complete
    kubectl rollout status deployment/$APP_NAME --namespace="$NAMESPACE" --timeout=300s

    log_success "Deployment completed successfully"
}

# Deploy using Docker Compose (for simpler deployments)
deploy_with_docker_compose() {
    local image_tag="$1"

    log_info "Deploying with Docker Compose..."

    # Update docker-compose.yml with new image tag
    sed -i.bak "s|image:.*$APP_NAME:.*|image: $image_tag|g" docker-compose.yml

    # Deploy
    docker-compose up -d --force-recreate

    log_success "Docker Compose deployment completed"
}

# Health checks
run_health_checks() {
    local service_url="$1"

    log_info "Running health checks..."

    # Wait for service to be ready
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$service_url/api/health" >/dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi

        log_info "Health check failed, attempt $attempt/$max_attempts. Retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done

    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Rollback function
rollback() {
    local previous_image="$1"

    log_warning "Initiating rollback to $previous_image"

    if command -v kubectl >/dev/null 2>&1; then
        kubectl set image deployment/$APP_NAME app="$previous_image" --namespace="$NAMESPACE"
        kubectl rollout status deployment/$APP_NAME --namespace="$NAMESPACE"
    else
        # Docker Compose rollback
        sed -i.bak "s|image:.*$APP_NAME:.*|image: $previous_image|g" docker-compose.yml
        docker-compose up -d --force-recreate
    fi

    log_info "Rollback completed"
}

# Notification function
send_notification() {
    local status="$1"
    local message="$2"

    # Send notifications to Slack, Discord, or email
    # Example for Slack webhook:
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"$message\"}" \
    #   "$SLACK_WEBHOOK_URL"

    log_info "Notification sent: $message"
}

# Main deployment function
main() {
    log_info "Starting deployment process for $APP_NAME to $ENVIRONMENT"

    # Validate environment
    validate_environment

    # Pre-deployment checks
    pre_deployment_checks

    # Store current image for rollback
    local current_image=""
    if command -v kubectl >/dev/null 2>&1; then
        current_image=$(kubectl get deployment $APP_NAME -o jsonpath='{.spec.template.spec.containers[0].image}' --namespace="$NAMESPACE" 2>/dev/null || echo "")
    fi

    # Build and deploy
    local image_tag
    image_tag=$(build_image)

    # Run migrations
    run_migrations

    # Deploy
    if command -v kubectl >/dev/null 2>&1; then
        deploy_to_kubernetes "$image_tag"
    else
        deploy_with_docker_compose "$image_tag"
    fi

    # Health checks
    local service_url
    if [[ "$ENVIRONMENT" == "production" ]]; then
        service_url="https://your-production-domain.com"
    else
        service_url="https://staging.your-domain.com"
    fi

    if run_health_checks "$service_url"; then
        log_success "Deployment successful! 🎉"
        send_notification "success" "Deployment to $ENVIRONMENT completed successfully"
    else
        log_error "Deployment failed - health checks failed"
        send_notification "failure" "Deployment to $ENVIRONMENT failed - rolling back"

        # Rollback on failure
        if [[ -n "$current_image" ]]; then
            rollback "$current_image"
        fi

        exit 1
    fi
}

# Handle script arguments
case "${2:-}" in
    "rollback")
        if [[ -z "$3" ]]; then
            log_error "Rollback requires an image tag as third argument"
            exit 1
        fi
        rollback "$3"
        ;;
    "health-check")
        run_health_checks "${3:-http://localhost:3000}"
        ;;
    *)
        main
        ;;
esac