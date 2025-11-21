/**
 * Automated Sequence Service
 * Handles automated follow-up sequences and drip campaigns
 */

import { sql } from '@vercel/postgres';
import { ClientCommunicationService } from './client-communication-service';

export interface CommunicationSequence {
  id: number;
  coachId: number;
  name: string;
  description: string;
  triggerEvent: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SequenceStep {
  id: number;
  sequenceId: number;
  stepOrder: number;
  delayDays: number;
  delayHours: number;
  templateId: number | null;
  customSubject: string | null;
  customContent: string | null;
  channel: 'email' | 'sms' | 'in_app';
  createdAt: Date;
}

export interface ClientSequenceEnrollment {
  id: number;
  clientId: number;
  sequenceId: number;
  stepCompleted: number;
  enrolledAt: Date;
  completedAt: Date | null;
  status: 'active' | 'completed' | 'paused';
}

/**
 * Create a new communication sequence
 */
export async function createSequence(
  coachId: number,
  sequenceData: Omit<CommunicationSequence, 'id' | 'coachId' | 'isActive' | 'createdAt' | 'updatedAt'>
): Promise<CommunicationSequence | null> {
  try {
    const result = await sql`
      INSERT INTO communication_sequences (coach_id, name, description, trigger_event, is_active)
      VALUES (${coachId}, ${sequenceData.name}, ${sequenceData.description}, ${sequenceData.triggerEvent}, true)
      RETURNING *
    `;

    const row = result.rows[0];
    return {
      id: row.id,
      coachId: row.coach_id,
      name: row.name,
      description: row.description,
      triggerEvent: row.trigger_event,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  } catch (error) {
    console.error('Error creating sequence:', error);
    return null;
  }
}

/**
 * Add a step to a sequence
 */
export async function addSequenceStep(
  sequenceId: number,
  stepData: Omit<SequenceStep, 'id' | 'sequenceId' | 'createdAt'>
): Promise<SequenceStep | null> {
  try {
    const result = await sql`
      INSERT INTO sequence_steps (
        sequence_id, step_order, delay_days, delay_hours, template_id,
        custom_subject, custom_content, channel
      )
      VALUES (
        ${sequenceId}, ${stepData.stepOrder}, ${stepData.delayDays}, ${stepData.delayHours},
        ${stepData.templateId}, ${stepData.customSubject}, ${stepData.customContent}, ${stepData.channel}
      )
      RETURNING *
    `;

    const row = result.rows[0];
    return {
      id: row.id,
      sequenceId: row.sequence_id,
      stepOrder: row.step_order,
      delayDays: row.delay_days,
      delayHours: row.delay_hours,
      templateId: row.template_id,
      customSubject: row.custom_subject,
      customContent: row.custom_content,
      channel: row.channel,
      createdAt: row.created_at
    };
  } catch (error) {
    console.error('Error adding sequence step:', error);
    return null;
  }
}

/**
 * Enroll a client in a sequence
 */
export async function enrollClientInSequence(
  clientId: number,
  sequenceId: number
): Promise<ClientSequenceEnrollment | null> {
  try {
    // Check if already enrolled
    const existing = await sql`
      SELECT * FROM client_sequence_enrollments
      WHERE client_id = ${clientId} AND sequence_id = ${sequenceId}
    `;

    if (existing.rows.length > 0) {
      return null; // Already enrolled
    }

    const result = await sql`
      INSERT INTO client_sequence_enrollments (client_id, sequence_id, step_completed, status)
      VALUES (${clientId}, ${sequenceId}, 0, 'active')
      RETURNING *
    `;

    const row = result.rows[0];
    return {
      id: row.id,
      clientId: row.client_id,
      sequenceId: row.sequence_id,
      stepCompleted: row.step_completed,
      enrolledAt: row.enrolled_at,
      completedAt: row.completed_at,
      status: row.status
    };
  } catch (error) {
    console.error('Error enrolling client in sequence:', error);
    return null;
  }
}

/**
 * Trigger sequence enrollment based on events
 */
export async function triggerSequenceEnrollment(
  clientId: number,
  triggerEvent: string
): Promise<void> {
  try {
    // Find sequences that match this trigger event
    const sequencesResult = await sql`
      SELECT * FROM communication_sequences
      WHERE trigger_event = ${triggerEvent} AND is_active = true
    `;

    for (const sequence of sequencesResult.rows) {
      await enrollClientInSequence(clientId, sequence.id);
      console.log(`Enrolled client ${clientId} in sequence "${sequence.name}"`);
    }
  } catch (error) {
    console.error('Error triggering sequence enrollment:', error);
  }
}

/**
 * Process sequence steps (should be called by cron job)
 */
export async function processSequenceSteps(): Promise<number> {
  try {
    // Get active enrollments that have steps due
    const enrollmentsResult = await sql`
      SELECT cse.*, cs.coach_id
      FROM client_sequence_enrollments cse
      JOIN communication_sequences cs ON cse.sequence_id = cs.id
      WHERE cse.status = 'active' AND cs.is_active = true
    `;

    let processed = 0;

    for (const enrollment of enrollmentsResult.rows) {
      try {
        const nextStep = enrollment.step_completed + 1;

        // Get the next step
        const stepResult = await sql`
          SELECT * FROM sequence_steps
          WHERE sequence_id = ${enrollment.sequence_id} AND step_order = ${nextStep}
        `;

        if (stepResult.rows.length === 0) {
          // No more steps, mark as completed
          await sql`
            UPDATE client_sequence_enrollments
            SET status = 'completed', completed_at = NOW()
            WHERE id = ${enrollment.id}
          `;
          continue;
        }

        const step = stepResult.rows[0];

        // Calculate when this step should be sent
        const enrolledAt = new Date(enrollment.enrolled_at);
        const stepTime = new Date(enrolledAt);
        stepTime.setDate(stepTime.getDate() + step.delay_days);
        stepTime.setHours(stepTime.getHours() + step.delay_hours);

        // Check if it's time to send
        if (stepTime <= new Date()) {
          // Create and send the message
          let messageData;

          if (step.template_id) {
            // Use template
            const templateResult = await sql`
              SELECT * FROM communication_templates WHERE id = ${step.template_id}
            `;

            if (templateResult.rows.length > 0) {
              const template = templateResult.rows[0];
              messageData = ClientCommunicationService.createMessageFromTemplate(
                {
                  id: template.id,
                  coachId: template.coach_id,
                  name: template.name,
                  category: template.category,
                  subject: template.subject,
                  content: template.content,
                  variables: template.variables,
                  isActive: template.is_active,
                  usageCount: template.usage_count,
                  createdAt: template.created_at,
                  updatedAt: template.updated_at
                },
                { clientName: 'Client' }, // Would get actual client data
                enrollment.coach_id,
                enrollment.client_id
              );
            }
          } else if (step.custom_content) {
            // Use custom content
            messageData = {
              coachId: enrollment.coach_id,
              clientId: enrollment.client_id,
              type: step.channel,
              subject: step.custom_subject,
              content: step.custom_content,
              status: 'draft' as const
            };
          }

          if (messageData) {
            const savedMessage = await ClientCommunicationService.saveMessage(messageData);
            if (savedMessage) {
              const sent = await ClientCommunicationService.sendMessage(savedMessage.id);
              if (sent) {
                // Update enrollment progress
                await sql`
                  UPDATE client_sequence_enrollments
                  SET step_completed = ${nextStep}
                  WHERE id = ${enrollment.id}
                `;
                processed++;
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing sequence step for enrollment ${enrollment.id}:`, error);
      }
    }

    console.log(`Processed ${processed} sequence steps`);
    return processed;
  } catch (error) {
    console.error('Error processing sequence steps:', error);
    return 0;
  }
}

/**
 * Get predefined sequences for common scenarios
 */
export function getPredefinedSequences(): Array<Omit<CommunicationSequence, 'id' | 'coachId' | 'isActive' | 'createdAt' | 'updatedAt'>> {
  return [
    {
      name: 'Welcome Series',
      description: 'Welcome new clients and get them started',
      triggerEvent: 'user_registered'
    },
    {
      name: 'Course Completion Follow-up',
      description: 'Follow up after course completion to reinforce learning',
      triggerEvent: 'course_completed'
    },
    {
      name: 'Inactive User Re-engagement',
      description: 'Re-engage users who haven\'t been active',
      triggerEvent: 'inactive_7_days'
    },
    {
      name: 'Goal Achievement Celebration',
      description: 'Celebrate when clients achieve their goals',
      triggerEvent: 'goal_achieved'
    },
    {
      name: 'Progress Check-in',
      description: 'Regular check-ins on client progress',
      triggerEvent: 'weekly_checkin'
    }
  ];
}

/**
 * Create predefined sequence with steps
 */
export async function createPredefinedSequence(
  coachId: number,
  sequenceName: string
): Promise<CommunicationSequence | null> {
  const predefined = getPredefinedSequences().find(s => s.name === sequenceName);
  if (!predefined) return null;

  const sequence = await createSequence(coachId, predefined);
  if (!sequence) return null;

  // Add default steps based on sequence type
  const steps = getDefaultStepsForSequence(sequenceName);
  for (const step of steps) {
    await addSequenceStep(sequence.id, step);
  }

  return sequence;
}

/**
 * Get default steps for predefined sequences
 */
function getDefaultStepsForSequence(sequenceName: string): Array<Omit<SequenceStep, 'id' | 'sequenceId' | 'createdAt'>> {
  switch (sequenceName) {
    case 'Welcome Series':
      return [
        {
          stepOrder: 1,
          delayDays: 0,
          delayHours: 1,
          templateId: null,
          customSubject: 'Welkom bij DatingAssistent! 👋',
          customContent: 'Hoi! Welkom bij je dating journey. Ik ben je coach en ik help je graag verder.',
          channel: 'email'
        },
        {
          stepOrder: 2,
          delayDays: 3,
          delayHours: 0,
          templateId: null,
          customSubject: 'Hoe gaat het met je eerste stappen?',
          customContent: 'Ik ben benieuwd hoe je eerste dagen bij DatingAssistent zijn geweest!',
          channel: 'email'
        }
      ];

    case 'Course Completion Follow-up':
      return [
        {
          stepOrder: 1,
          delayDays: 1,
          delayHours: 0,
          templateId: null,
          customSubject: 'Gefeliciteerd met het voltooien van je cursus! 🎉',
          customContent: 'Wat geweldig dat je de cursus hebt afgerond! Hoe ga je de geleerde lessen toepassen?',
          channel: 'email'
        },
        {
          stepOrder: 2,
          delayDays: 7,
          delayHours: 0,
          templateId: null,
          customSubject: 'Hoe gaat het met het toepassen van wat je hebt geleerd?',
          customContent: 'Ik ben benieuwd hoe het gaat met het toepassen van de cursusinhoud in de praktijk.',
          channel: 'email'
        }
      ];

    case 'Inactive User Re-engagement':
      return [
        {
          stepOrder: 1,
          delayDays: 0,
          delayHours: 0,
          templateId: null,
          customSubject: 'We missen je! 💭',
          customContent: 'Het is al even geleden dat we van je hoorden. Hoe gaat het met je dating journey?',
          channel: 'email'
        },
        {
          stepOrder: 2,
          delayDays: 3,
          delayHours: 0,
          templateId: null,
          customSubject: 'Een kleine reminder...',
          customContent: 'Herinnering: je hebt nog zoveel potentieel om te benutten!',
          channel: 'in_app'
        }
      ];

    default:
      return [];
  }
}

/**
 * Get sequence analytics
 */
export async function getSequenceAnalytics(coachId: number): Promise<{
  totalSequences: number;
  activeEnrollments: number;
  completedSequences: number;
  averageCompletionRate: number;
}> {
  try {
    // Get sequence count
    const sequencesResult = await sql`
      SELECT COUNT(*) as count FROM communication_sequences WHERE coach_id = ${coachId}
    `;

    // Get enrollment stats
    const enrollmentsResult = await sql`
      SELECT
        COUNT(*) as total_enrollments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM client_sequence_enrollments cse
      JOIN communication_sequences cs ON cse.sequence_id = cs.id
      WHERE cs.coach_id = ${coachId}
    `;

    const totalSequences = parseInt(sequencesResult.rows[0].count);
    const totalEnrollments = parseInt(enrollmentsResult.rows[0].total_enrollments);
    const completedEnrollments = parseInt(enrollmentsResult.rows[0].completed);

    return {
      totalSequences,
      activeEnrollments: totalEnrollments - completedEnrollments,
      completedSequences: completedEnrollments,
      averageCompletionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0
    };
  } catch (error) {
    console.error('Error getting sequence analytics:', error);
    return {
      totalSequences: 0,
      activeEnrollments: 0,
      completedSequences: 0,
      averageCompletionRate: 0
    };
  }
}