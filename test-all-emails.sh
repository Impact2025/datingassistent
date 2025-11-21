#!/bin/bash

# Test All Email Templates Script
# Usage: ./test-all-emails.sh your.email@gmail.com

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if email provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide a test email address${NC}"
    echo "Usage: ./test-all-emails.sh your.email@gmail.com"
    exit 1
fi

TEST_EMAIL=$1
BASE_URL="http://localhost:9000"

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}EMAIL TEMPLATE TEST SCRIPT${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""
echo -e "Test email: ${GREEN}$TEST_EMAIL${NC}"
echo -e "Base URL: ${GREEN}$BASE_URL${NC}"
echo ""
echo -e "${BLUE}Starting tests...${NC}"
echo ""

# Function to test an email
test_email() {
    local email_type=$1
    local email_name=$2

    echo -e "${BLUE}Testing:${NC} $email_name ($email_type)"

    response=$(curl -s -X POST "$BASE_URL/api/test-email" \
        -H "Content-Type: application/json" \
        -d "{\"emailType\": \"$email_type\", \"testEmail\": \"$TEST_EMAIL\"}")

    if echo "$response" | grep -q "success"; then
        echo -e "${GREEN}✓ SUCCESS${NC} - $email_name sent"
    else
        echo -e "${RED}✗ FAILED${NC} - $email_name"
        echo "Response: $response"
    fi

    echo ""
    sleep 2  # Delay to avoid rate limiting
}

# ONBOARDING EMAILS
echo -e "${BLUE}=== ONBOARDING EMAILS (7) ===${NC}"
echo ""

test_email "welcome" "1. Welcome Email"
test_email "profile_optimization_reminder" "2. Profile Optimization"
test_email "first_win" "3. First Win"
test_email "course_introduction" "4. Course Introduction"
test_email "weekly_checkin" "5. Weekly Check-in"
test_email "feature_deepdive_chat" "6. Feature Deep Dive - Chat"
test_email "mid_trial_check" "7. Mid-Trial Check"

# ENGAGEMENT EMAILS
echo -e "${BLUE}=== ENGAGEMENT EMAILS (5) ===${NC}"
echo ""

test_email "course_completion" "8. Course Completion"
test_email "weekly_digest" "9. Weekly Digest"
test_email "milestone_achievement" "10. Milestone Achievement"
test_email "monthly_progress" "11. Monthly Progress Report"
test_email "inactivity_3days" "12. Inactivity Alert (3 days)"

# RETENTION & UPSELL EMAILS
echo -e "${BLUE}=== RETENTION & UPSELL (3) ===${NC}"
echo ""

test_email "subscription_renewal" "13. Subscription Renewal"
test_email "payment_failed" "14. Payment Failed"
test_email "feature_limit_reached" "15. Feature Limit Reached"

# Summary
echo -e "${BLUE}==================================${NC}"
echo -e "${GREEN}✓ All 15 email tests completed!${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""
echo -e "Check your inbox: ${GREEN}$TEST_EMAIL${NC}"
echo ""
echo -e "${BLUE}Tips:${NC}"
echo "- Check spam folder if emails don't arrive"
echo "- Allow 1-2 minutes for all emails to arrive"
echo "- Check SendGrid Activity Feed for delivery status"
echo ""
