# Test All Email Templates Script (PowerShell)
# Usage: .\test-all-emails.ps1 your.email@gmail.com

param(
    [Parameter(Mandatory=$true)]
    [string]$TestEmail
)

$BaseUrl = "http://localhost:9000"

Write-Host "==================================" -ForegroundColor Blue
Write-Host "EMAIL TEMPLATE TEST SCRIPT" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Test email: " -NoNewline
Write-Host $TestEmail -ForegroundColor Green
Write-Host "Base URL: " -NoNewline
Write-Host $BaseUrl -ForegroundColor Green
Write-Host ""
Write-Host "Starting tests..." -ForegroundColor Blue
Write-Host ""

# Function to test an email
function Test-Email {
    param(
        [string]$EmailType,
        [string]$EmailName
    )

    Write-Host "Testing: " -NoNewline -ForegroundColor Blue
    Write-Host "$EmailName ($EmailType)" -ForegroundColor White

    $body = @{
        emailType = $EmailType
        testEmail = $TestEmail
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/test-email" `
            -Method Post `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction Stop

        Write-Host "✓ SUCCESS" -ForegroundColor Green -NoNewline
        Write-Host " - $EmailName sent"
    }
    catch {
        Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
        Write-Host " - $EmailName"
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Start-Sleep -Seconds 2  # Delay to avoid rate limiting
}

# ONBOARDING EMAILS
Write-Host "=== ONBOARDING EMAILS (7) ===" -ForegroundColor Blue
Write-Host ""

Test-Email "welcome" "1. Welcome Email"
Test-Email "profile_optimization_reminder" "2. Profile Optimization"
Test-Email "first_win" "3. First Win"
Test-Email "course_introduction" "4. Course Introduction"
Test-Email "weekly_checkin" "5. Weekly Check-in"
Test-Email "feature_deepdive_chat" "6. Feature Deep Dive - Chat"
Test-Email "mid_trial_check" "7. Mid-Trial Check"

# ENGAGEMENT EMAILS
Write-Host "=== ENGAGEMENT EMAILS (5) ===" -ForegroundColor Blue
Write-Host ""

Test-Email "course_completion" "8. Course Completion"
Test-Email "weekly_digest" "9. Weekly Digest"
Test-Email "milestone_achievement" "10. Milestone Achievement"
Test-Email "monthly_progress" "11. Monthly Progress Report"
Test-Email "inactivity_3days" "12. Inactivity Alert (3 days)"

# RETENTION & UPSELL EMAILS
Write-Host "=== RETENTION & UPSELL (3) ===" -ForegroundColor Blue
Write-Host ""

Test-Email "subscription_renewal" "13. Subscription Renewal"
Test-Email "payment_failed" "14. Payment Failed"
Test-Email "feature_limit_reached" "15. Feature Limit Reached"

# Summary
Write-Host "==================================" -ForegroundColor Blue
Write-Host "✓ All 15 email tests completed!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Check your inbox: " -NoNewline
Write-Host $TestEmail -ForegroundColor Green
Write-Host ""
Write-Host "Tips:" -ForegroundColor Blue
Write-Host "- Check spam folder if emails don't arrive"
Write-Host "- Allow 1-2 minutes for all emails to arrive"
Write-Host "- Check SendGrid Activity Feed for delivery status"
Write-Host ""
