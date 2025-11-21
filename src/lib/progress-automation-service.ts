/**
 * Progress Automation Service
 * Triggers automated communications based on client progress events
 */

import { sql } from '@vercel/postgres';
import { triggerSequenceEnrollment } from './automated-sequence-service';
import { ClientCommunicationService } from './client-communication-service';
import { createGoalAchievementNotification, createCourseCompletionNotification } from './in-app-notification-service';

export interface ProgressEvent {
  userId: number;
  eventType: 'goal_completed' | 'course_started' | 'course_completed' | 'streak_achieved' | 'milestone_reached' | 'inactive_warning' | 'profile_updated' | 'journey_started' | 'step_completed' | 'phase_completed' | 'scan_completed' | 'goals_set' | 'profile_optimized';
  eventData: Record<string, any>;
  occurredAt: Date;
}

/**
 * Track a progress event and trigger automated communications
 */
export async function trackProgressEvent(event: ProgressEvent): Promise<void> {
  try {
    // Store the event
    await sql`
      INSERT INTO progress_events (user_id, event_type, event_data, occurred_at)
      VALUES (${event.userId}, ${event.eventType}, ${JSON.stringify(event.eventData)}, ${event.occurredAt.toISOString()})
    `;

    // Trigger appropriate automated responses
    await handleProgressEvent(event);

    console.log(`📊 Progress event tracked: ${event.eventType} for user ${event.userId}`);
  } catch (error) {
    console.error('Error tracking progress event:', error);
  }
}

/**
 * Handle different types of progress events
 */
async function handleProgressEvent(event: ProgressEvent): Promise<void> {
  switch (event.eventType) {
    case 'goal_completed':
      await handleGoalCompleted(event);
      break;
    case 'course_started':
      await handleCourseStarted(event);
      break;
    case 'course_completed':
      await handleCourseCompleted(event);
      break;
    case 'streak_achieved':
      await handleStreakAchieved(event);
      break;
    case 'milestone_reached':
      await handleMilestoneReached(event);
      break;
    case 'inactive_warning':
      await handleInactiveWarning(event);
      break;
    case 'profile_updated':
      await handleProfileUpdated(event);
      break;
  }
}

/**
 * Handle goal completion events
 */
async function handleGoalCompleted(event: ProgressEvent): Promise<void> {
  try {
    const { goalId, goalTitle, goalCategory } = event.eventData;

    // Trigger sequence enrollment for goal achievement
    await triggerSequenceEnrollment(event.userId, 'goal_achieved');

    // Create in-app notification
    await createGoalAchievementNotification(
      event.userId,
      event.eventData.goalTitle || 'Doel',
      `Je hebt succesvol je doel "${event.eventData.goalTitle}" bereikt!`
    );

    // Schedule follow-up communication (coach check-in)
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 3); // 3 days after completion

    // Get coach for this client
    const coachResult = await sql`
      SELECT coach_user_id FROM coach_client_assignments
      WHERE client_user_id = ${event.userId} AND status = 'active'
      LIMIT 1
    `;

    if (coachResult.rows.length > 0) {
      const coachId = coachResult.rows[0].coach_user_id;

      // Create a congratulatory message from coach
      const messageData = {
        coachId,
        clientId: event.userId,
        type: 'email' as const,
        subject: `Gefeliciteerd met je doelbereiking! 🎉`,
        content: `Hoi!

Ik zag dat je zojuist je doel "${event.eventData.goalTitle}" hebt bereikt! Dat is geweldig nieuws! 🚀

Dit laat zien dat je serieus bent over verandering en dat je de juiste stappen zet. Ik ben trots op je voortgang.

Wat ga je nu als volgende stap doen? Ik help je graag met het stellen van nieuwe doelen die je nog verder brengen.

Laat me weten hoe je je voelt over deze mijlpaal!

Groet,
Je Dating Coach`,
        status: 'draft' as const
      };

      const message = await ClientCommunicationService.saveMessage(messageData);
      if (message) {
        // Schedule for 3 days later
        await ClientCommunicationService.scheduleMessage(message.id, followUpDate);
      }
    }

  } catch (error) {
    console.error('Error handling goal completed event:', error);
  }
}

/**
 * Handle course started events
 */
async function handleCourseStarted(event: ProgressEvent): Promise<void> {
  try {
    // Trigger sequence enrollment for course engagement
    await triggerSequenceEnrollment(event.userId, 'course_started');

    // Create in-app notification
    await createCourseCompletionNotification(
      event.userId,
      event.eventData.courseTitle || 'Cursus'
    );

    // Schedule welcome message for the course
    const welcomeDate = new Date();
    welcomeDate.setHours(welcomeDate.getHours() + 2); // 2 hours after starting

    // Get coach for this client
    const coachResult = await sql`
      SELECT coach_user_id FROM coach_client_assignments
      WHERE client_user_id = ${event.userId} AND status = 'active'
      LIMIT 1
    `;

    if (coachResult.rows.length > 0) {
      const coachId = coachResult.rows[0].coach_user_id;

      const messageData = {
        coachId,
        clientId: event.userId,
        type: 'in_app' as const,
        subject: undefined,
        content: `Goed bezig! Ik zie dat je begonnen bent met de cursus "${event.eventData.courseTitle}". Als je vragen hebt tijdens het volgen, kun je altijd bij me terecht! 💪`,
        status: 'draft' as const
      };

      const message = await ClientCommunicationService.saveMessage(messageData);
      if (message) {
        await ClientCommunicationService.scheduleMessage(message.id, welcomeDate);
      }
    }

  } catch (error) {
    console.error('Error handling course started event:', error);
  }
}

/**
 * Handle course completion events
 */
async function handleCourseCompleted(event: ProgressEvent): Promise<void> {
  try {
    // Trigger sequence enrollment for course completion follow-up
    await triggerSequenceEnrollment(event.userId, 'course_completed');

    // Create in-app notification
    await createCourseCompletionNotification(
      event.userId,
      event.eventData.courseTitle || 'Cursus'
    );

    // Schedule celebration and next steps discussion
    const celebrationDate = new Date();
    celebrationDate.setDate(celebrationDate.getDate() + 1); // Next day

    // Get coach for this client
    const coachResult = await sql`
      SELECT coach_user_id FROM coach_client_assignments
      WHERE client_user_id = ${event.userId} AND status = 'active'
      LIMIT 1
    `;

    if (coachResult.rows.length > 0) {
      const coachId = coachResult.rows[0].coach_user_id;

      const messageData = {
        coachId,
        clientId: event.userId,
        type: 'email' as const,
        subject: `Gefeliciteerd met het voltooien van "${event.eventData.courseTitle}"! 🎓`,
        content: `Hoi!

GIGANTISCH gefeliciteerd met het voltooien van de cursus "${event.eventData.courseTitle}"! Dat is een enorme stap voorwaarts in je dating journey. 🌟

Ik ben onder de indruk van je doorzettingsvermogen en toewijding. Dit soort successen bouwen je zelfvertrouwen enorm op.

Laten we binnenkort even sparren over:
- Wat je het meest hebt geleerd
- Hoe je dit gaat toepassen in de praktijk
- Wat je volgende doel zou kunnen zijn

Wanneer zou je tijd hebben voor een kort gesprek?

Groet,
Je Dating Coach`,
        status: 'draft' as const
      };

      const message = await ClientCommunicationService.saveMessage(messageData);
      if (message) {
        await ClientCommunicationService.scheduleMessage(message.id, celebrationDate);
      }
    }

  } catch (error) {
    console.error('Error handling course completed event:', error);
  }
}

/**
 * Handle streak achievement events
 */
async function handleStreakAchieved(event: ProgressEvent): Promise<void> {
  try {
    const { streakType, streakCount } = event.eventData;

    // Create in-app notification
    await createGoalAchievementNotification(
      event.userId,
      `${streakCount} dagen ${streakType}`,
      `Je hebt een streak van ${streakCount} dagen bereikt! Blijf zo doorgaan! 🔥`
    );

    // For significant streaks, send coach message
    if (streakCount >= 7) {
      const coachResult = await sql`
        SELECT coach_user_id FROM coach_client_assignments
        WHERE client_user_id = ${event.userId} AND status = 'active'
        LIMIT 1
      `;

      if (coachResult.rows.length > 0) {
        const coachId = coachResult.rows[0].coach_user_id;

        const messageData = {
          coachId,
          clientId: event.userId,
          type: 'in_app' as const,
          subject: undefined,
          content: `Wow! ${streakCount} dagen op rij ${streakType}? Dat is ongelooflijk consistent! Je toont hier echt doorzettingsvermogen. Dit soort gewoontes leiden tot grote successen. Proud of you! 💪`,
          status: 'draft' as const
        };

        const message = await ClientCommunicationService.saveMessage(messageData);
        if (message) {
          await ClientCommunicationService.sendMessage(message.id);
        }
      }
    }

  } catch (error) {
    console.error('Error handling streak achieved event:', error);
  }
}

/**
 * Handle milestone reached events
 */
async function handleMilestoneReached(event: ProgressEvent): Promise<void> {
  try {
    const { milestoneType, milestoneValue } = event.eventData;

    // Create celebration notification
    await createGoalAchievementNotification(
      event.userId,
      `${milestoneType} ${milestoneValue}`,
      `Nieuwe mijlpaal bereikt: ${milestoneValue} ${milestoneType}! Dit is een moment om trots op te zijn. 🎯`
    );

    // Trigger appropriate sequence
    await triggerSequenceEnrollment(event.userId, 'milestone_reached');

  } catch (error) {
    console.error('Error handling milestone reached event:', error);
  }
}

/**
 * Handle inactive warning events
 */
async function handleInactiveWarning(event: ProgressEvent): Promise<void> {
  try {
    const { daysInactive } = event.eventData;

    // Trigger re-engagement sequence
    await triggerSequenceEnrollment(event.userId, 'inactive_3_days');

    // Send gentle re-engagement message
    const coachResult = await sql`
      SELECT coach_user_id FROM coach_client_assignments
      WHERE client_user_id = ${event.userId} AND status = 'active'
      LIMIT 1
    `;

    if (coachResult.rows.length > 0) {
      const coachId = coachResult.rows[0].coach_user_id;

      const messageData = {
        coachId,
        clientId: event.userId,
        type: 'email' as const,
        subject: 'We missen je! 💭',
        content: `Hoi!

Het is al ${daysInactive} dagen geleden dat we contact hadden. Ik vroeg me af hoe het gaat met je dating journey.

Soms loopt het even niet zoals gepland, en dat is helemaal oké. Het belangrijkste is dat we weer in beweging komen.

Heb je:
- Vragen waar je tegenaan loopt?
- Onderwerpen waar je meer over wilt leren?
- Doelen die je wilt bijstellen?

Ik ben er om je te helpen, wanneer je er klaar voor bent.

Groet,
Je Dating Coach`,
        status: 'draft' as const
      };

      const message = await ClientCommunicationService.saveMessage(messageData);
      if (message) {
        await ClientCommunicationService.sendMessage(message.id);
      }
    }

  } catch (error) {
    console.error('Error handling inactive warning event:', error);
  }
}

/**
 * Handle profile updated events
 */
async function handleProfileUpdated(event: ProgressEvent): Promise<void> {
  try {
    // Create positive reinforcement notification
    await createGoalAchievementNotification(
      event.userId,
      'Profiel Bijgewerkt',
      'Goed bezig! Een up-to-date profiel is cruciaal voor dating succes. 💪'
    );

    // If profile is now complete, trigger celebration
    const { profileComplete } = event.eventData;
    if (profileComplete) {
      await triggerSequenceEnrollment(event.userId, 'profile_completed');
    }

  } catch (error) {
    console.error('Error handling profile updated event:', error);
  }
}

/**
 * Get progress automation stats
 */
export async function getProgressAutomationStats(coachId: number): Promise<{
  totalEvents: number;
  eventsByType: Record<string, number>;
  automatedCommunications: number;
  engagementRate: number;
}> {
  try {
    // Get event counts
    const eventsResult = await sql`
      SELECT
        COUNT(*) as total_events,
        event_type,
        COUNT(*) as type_count
      FROM progress_events pe
      JOIN coach_client_assignments cca ON pe.user_id = cca.client_user_id
      WHERE cca.coach_user_id = ${coachId}
        AND pe.occurred_at > NOW() - INTERVAL '30 days'
      GROUP BY event_type
    `;

    // Get automated communication counts
    const commsResult = await sql`
      SELECT COUNT(*) as automated_comms
      FROM coach_client_messages ccm
      WHERE ccm.coach_id = ${coachId}
        AND ccm.metadata->>'automated' = 'true'
        AND ccm.created_at > NOW() - INTERVAL '30 days'
    `;

    const eventsByType: Record<string, number> = {};
    let totalEvents = 0;

    eventsResult.rows.forEach(row => {
      eventsByType[row.event_type] = parseInt(row.type_count);
      totalEvents += parseInt(row.type_count);
    });

    const automatedCommunications = parseInt(commsResult.rows[0]?.automated_comms || '0');
    const engagementRate = totalEvents > 0 ? (automatedCommunications / totalEvents) * 100 : 0;

    return {
      totalEvents,
      eventsByType,
      automatedCommunications,
      engagementRate
    };
  } catch (error) {
    console.error('Error getting progress automation stats:', error);
    return {
      totalEvents: 0,
      eventsByType: {},
      automatedCommunications: 0,
      engagementRate: 0
    };
  }
}

/**
 * Process pending progress events (should be called by cron job)
 */
export async function processProgressEvents(): Promise<number> {
  try {
    console.log('🔄 Processing progress events...');

    // Get unprocessed events from the last 24 hours
    const eventsResult = await sql`
      SELECT * FROM progress_events
      WHERE processed = false
        AND occurred_at > NOW() - INTERVAL '24 hours'
      ORDER BY occurred_at ASC
      LIMIT 100
    `;

    let processed = 0;

    for (const eventRow of eventsResult.rows) {
      try {
        const event: ProgressEvent = {
          userId: eventRow.user_id,
          eventType: eventRow.event_type,
          eventData: eventRow.event_data || {},
          occurredAt: new Date(eventRow.occurred_at)
        };

        await handleProgressEvent(event);

        // Mark as processed
        await sql`
          UPDATE progress_events SET processed = true WHERE id = ${eventRow.id}
        `;

        processed++;
      } catch (error) {
        console.error(`Error processing progress event ${eventRow.id}:`, error);
      }
    }

    console.log(`✅ Processed ${processed} progress events`);
    return processed;
  } catch (error) {
    console.error('Error processing progress events:', error);
    return 0;
  }
}