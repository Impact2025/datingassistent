import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin-audit';
import { CronJobsService } from '@/lib/cron-jobs';

export async function POST(request: NextRequest) {
  let adminUser = null;

  try {
    // Proper admin authentication using centralized auth system
    adminUser = await requireAdmin(request);

    const body = await request.json();
    const { jobType } = body;

    // Input validation
    if (!jobType || typeof jobType !== 'string') {
      return NextResponse.json({ error: 'Valid jobType is required' }, { status: 400 });
    }

    // Validate job type
    const allowedJobs = [
      'monthly-reports',
      'weekly-reviews',
      'daily-notifications',
      'hourly-analysis',
      'weekly-cleanup',
      'all-jobs'
    ];

    if (!allowedJobs.includes(jobType)) {
      await logAdminAction(adminUser.id, 'CRON_JOB_INVALID', 'cron_jobs', false, {
        jobType,
        allowedJobs
      });

      return NextResponse.json(
        { error: `Invalid job type. Available: ${allowedJobs.join(', ')}` },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    try {
      switch (jobType) {
        case 'monthly-reports':
          const monthlyResult = await CronJobsService.runMonthlyJobs();
          await logAdminAction(adminUser.id, 'CRON_JOB_EXECUTED', 'cron_jobs', monthlyResult.success, {
            jobType: 'monthly-reports',
            processed: monthlyResult.processed,
            errors: monthlyResult.errors,
            duration: Date.now() - startTime
          });
          return NextResponse.json({
            success: monthlyResult.success,
            message: `Monthly reports: ${monthlyResult.processed} processed, ${monthlyResult.errors} errors`,
            result: monthlyResult
          });

        case 'weekly-reviews':
          const weeklyResult = await CronJobsService.runWeeklyJobs();
          await logAdminAction(adminUser.id, 'CRON_JOB_EXECUTED', 'cron_jobs', weeklyResult.success, {
            jobType: 'weekly-reviews',
            processed: weeklyResult.processed,
            errors: weeklyResult.errors,
            duration: Date.now() - startTime
          });
          return NextResponse.json({
            success: weeklyResult.success,
            message: `Weekly reviews: ${weeklyResult.processed} processed, ${weeklyResult.errors} errors`,
            result: weeklyResult
          });

        case 'daily-notifications':
          const dailyResult = await CronJobsService.runDailyJobs();
          await logAdminAction(adminUser.id, 'CRON_JOB_EXECUTED', 'cron_jobs', dailyResult.success, {
            jobType: 'daily-notifications',
            processed: dailyResult.processed,
            errors: dailyResult.errors,
            duration: Date.now() - startTime
          });
          return NextResponse.json({
            success: dailyResult.success,
            message: `Daily notifications: ${dailyResult.processed} processed, ${dailyResult.errors} errors`,
            result: dailyResult
          });

        case 'hourly-analysis':
          const hourlyResult = await CronJobsService.runHourlyJobs();
          await logAdminAction(adminUser.id, 'CRON_JOB_EXECUTED', 'cron_jobs', hourlyResult.success, {
            jobType: 'hourly-analysis',
            processed: hourlyResult.processed,
            errors: hourlyResult.errors,
            duration: Date.now() - startTime
          });
          return NextResponse.json({
            success: hourlyResult.success,
            message: `Hourly analysis: ${hourlyResult.processed} processed, ${hourlyResult.errors} errors`,
            result: hourlyResult
          });

        case 'weekly-cleanup':
          // For now, just log that cleanup would run
          await logAdminAction(adminUser.id, 'CRON_JOB_EXECUTED', 'cron_jobs', true, {
            jobType: 'weekly-cleanup',
            note: 'Cleanup functionality would be implemented here',
            duration: Date.now() - startTime
          });
          return NextResponse.json({
            success: true,
            message: 'Weekly cleanup completed (placeholder)',
            result: { processed: 0, errors: 0, duration: Date.now() - startTime }
          });

        case 'all-jobs':
          // Run all jobs (for testing)
          console.log('Running all cron jobs...');

          const results = await Promise.allSettled([
            CronJobsService.runMonthlyJobs(),
            CronJobsService.runWeeklyJobs(),
            CronJobsService.runDailyJobs(),
            CronJobsService.runHourlyJobs()
          ]);

          const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
          const partialSuccessCount = results.filter(r => r.status === 'fulfilled' && !r.value.success).length;
          const failureCount = results.filter(r => r.status === 'rejected').length;

          const totalProcessed = results
            .filter(r => r.status === 'fulfilled')
            .reduce((sum, r) => sum + r.value.processed, 0);

          const totalErrors = results
            .filter(r => r.status === 'fulfilled')
            .reduce((sum, r) => sum + r.value.errors, 0);

          await logAdminAction(adminUser.id, 'CRON_JOB_EXECUTED', 'cron_jobs', failureCount === 0, {
            jobType: 'all-jobs',
            totalJobs: results.length,
            successfulJobs: successCount,
            partialSuccessJobs: partialSuccessCount,
            failedJobs: failureCount,
            totalProcessed,
            totalErrors,
            duration: Date.now() - startTime
          });

          return NextResponse.json({
            success: failureCount === 0,
            message: `All jobs: ${successCount} fully successful, ${partialSuccessCount} partial, ${failureCount} failed. Total: ${totalProcessed} processed, ${totalErrors} errors`,
            summary: {
              totalJobs: results.length,
              successful: successCount,
              partial: partialSuccessCount,
              failed: failureCount,
              totalProcessed,
              totalErrors
            }
          });

        default:
          await logAdminAction(adminUser.id, 'CRON_JOB_INVALID', 'cron_jobs', false, {
            jobType,
            availableJobs: ['monthly-reports', 'weekly-reviews', 'daily-notifications', 'hourly-analysis', 'weekly-cleanup', 'all-jobs']
          });

          return NextResponse.json(
            { error: `Invalid job type: ${jobType}. Available: monthly-reports, weekly-reviews, daily-notifications, hourly-analysis, weekly-cleanup, all-jobs` },
            { status: 400 }
          );
      }
    } catch (jobError) {
      console.error('Cron job execution error:', jobError);
      await logAdminAction(adminUser.id, 'CRON_JOB_FAILED', 'cron_jobs', false, {
        jobType,
        error: jobError instanceof Error ? jobError.message : 'Unknown error',
        duration: Date.now() - startTime
      });

      return NextResponse.json(
        {
          error: 'Failed to execute cron job',
          details: jobError instanceof Error ? jobError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error executing cron job:', error);

    // Log the failure
    if (adminUser) {
      await logAdminAction(adminUser.id, 'CRON_JOB_FAILED', 'cron_jobs', false, {
        error: error instanceof Error ? error.message : 'Unknown error',
        jobType: 'unknown'
      });
    }

    if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to execute cron job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  let adminUser = null;

  try {
    // Proper admin authentication
    adminUser = await requireAdmin(request);

    // Get cron job statistics
    const stats = CronJobsService.getJobStats();
    const history = CronJobsService.getJobHistory(10);

    // Log the access
    await logAdminAction(adminUser.id, 'CRON_STATUS_VIEWED', 'cron_jobs', true, {
      statsRequested: true,
      historyRequested: true
    });

    // Return available cron jobs with current status
    return NextResponse.json({
      availableJobs: [
        {
          type: 'monthly-reports',
          description: 'Generate monthly AI reports for all clients',
          schedule: '1st of every month',
          lastRun: history.find(h => h.jobName === 'monthly_jobs')?.timestamp || null,
          status: history.find(h => h.jobName === 'monthly_jobs')?.success ? 'success' : 'failed'
        },
        {
          type: 'weekly-reviews',
          description: 'Generate weekly AI reviews from client reflections',
          schedule: 'Every Monday',
          lastRun: history.find(h => h.jobName === 'weekly_jobs')?.timestamp || null,
          status: history.find(h => h.jobName === 'weekly_jobs')?.success ? 'success' : 'failed'
        },
        {
          type: 'daily-notifications',
          description: 'Generate daily coach notifications',
          schedule: 'Daily at 9 AM',
          lastRun: history.find(h => h.jobName === 'daily_jobs')?.timestamp || null,
          status: history.find(h => h.jobName === 'daily_jobs')?.success ? 'success' : 'failed'
        },
        {
          type: 'hourly-analysis',
          description: 'Process pending AI analysis queue',
          schedule: 'Every hour',
          lastRun: history.find(h => h.jobName === 'hourly_jobs')?.timestamp || null,
          status: history.find(h => h.jobName === 'hourly_jobs')?.success ? 'success' : 'failed'
        },
        {
          type: 'weekly-cleanup',
          description: 'Clean up old data and optimize database',
          schedule: 'Every Sunday',
          lastRun: null, // Not implemented yet
          status: 'pending'
        },
        {
          type: 'all-jobs',
          description: 'Run all cron jobs (for testing)',
          schedule: 'Manual only',
          lastRun: null,
          status: 'manual'
        }
      ],
      statistics: stats,
      recentHistory: history.slice(0, 5)
    });
  } catch (error) {
    console.error('Error fetching cron jobs:', error);

    // Log authentication/authorization failures
    if (adminUser) {
      await logAdminAction(adminUser.id, 'CRON_STATUS_FAILED', 'cron_jobs', false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch cron jobs' },
      { status: 500 }
    );
  }
}