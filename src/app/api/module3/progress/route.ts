import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';
import { Module3Progress } from '@/components/courses/module3/types/module3.types';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get Module 3 progress from user profile
    const result = await sql`
      SELECT
        profieltekst_kernkrachten_validatie,
        profieltekst_cliché_score,
        trigger_zin_kwaliteit_score,
        profieltekst_proof_count,
        profieltekst_hechtings_audit,
        module3_completed_at,
        module3_last_updated
      FROM gebruiker_profielen
      WHERE gebruiker_id = ${userId.toString()}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({
        currentPhase: 'authenticiteit',
        completedPhases: [],
        authenticiteitValidated: false,
        clichéScore: 0,
        triggerBestScore: 0,
        proofCount: 0
      });
    }

    const profile = result.rows[0];

    // Determine completed phases
    const completedPhases: string[] = [];
    if (profile.profieltekst_kernkrachten_validatie) completedPhases.push('authenticiteit');
    if (profile.profieltekst_cliché_score && profile.profieltekst_cliché_score > 0) completedPhases.push('connectie');
    if (profile.trigger_zin_kwaliteit_score && profile.trigger_zin_kwaliteit_score > 0) completedPhases.push('trigger');
    if (profile.profieltekst_proof_count && profile.profieltekst_proof_count > 0) completedPhases.push('evidence');
    if (profile.profieltekst_hechtings_audit) completedPhases.push('intentie');

    // Determine current phase
    const allPhases = ['authenticiteit', 'connectie', 'trigger', 'evidence', 'intentie'];
    const currentPhase = profile.module3_completed_at ? 'completed' :
      allPhases.find(phase => !completedPhases.includes(phase)) || 'authenticiteit';

    const progress: Module3Progress = {
      currentPhase: currentPhase as any,
      completedPhases: completedPhases as any[],
      authenticiteitValidated: profile.profieltekst_kernkrachten_validatie || false,
      clichéScore: profile.profieltekst_cliché_score || 0,
      triggerBestScore: profile.trigger_zin_kwaliteit_score || 0,
      proofCount: profile.profieltekst_proof_count || 0,
      hechtingsAudit: profile.profieltekst_hechtings_audit,
      completedAt: profile.module3_completed_at,
      lastUpdated: profile.module3_last_updated
    };

    return NextResponse.json(progress);

  } catch (error) {
    console.error('Module 3 progress fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const updates = await request.json();

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.profieltekst_kernkrachten_validatie !== undefined) {
      updateFields.push(`profieltekst_kernkrachten_validatie = $${paramIndex++}`);
      values.push(updates.profieltekst_kernkrachten_validatie);
    }

    if (updates.profieltekst_cliché_score !== undefined) {
      updateFields.push(`profieltekst_cliché_score = $${paramIndex++}`);
      values.push(updates.profieltekst_cliché_score);
    }

    if (updates.trigger_zin_kwaliteit_score !== undefined) {
      updateFields.push(`trigger_zin_kwaliteit_score = $${paramIndex++}`);
      values.push(updates.trigger_zin_kwaliteit_score);
    }

    if (updates.profieltekst_proof_count !== undefined) {
      updateFields.push(`profieltekst_proof_count = $${paramIndex++}`);
      values.push(updates.profieltekst_proof_count);
    }

    if (updates.profieltekst_hechtings_audit !== undefined) {
      updateFields.push(`profieltekst_hechtings_audit = $${paramIndex++}`);
      values.push(updates.profieltekst_hechtings_audit);
    }

    if (updates.module3_completed_at !== undefined) {
      updateFields.push(`module3_completed_at = $${paramIndex++}`);
      values.push(updates.module3_completed_at);
    }

    // Always update last_updated
    updateFields.push(`module3_last_updated = NOW()`);

    if (updateFields.length === 1) {
      return NextResponse.json({ message: 'No fields to update' });
    }

    values.push(userId.toString());

    // Update individual fields
    const updatePromises = [];

    if (updates.profieltekst_kernkrachten_validatie !== undefined) {
      updatePromises.push(
        sql`UPDATE gebruiker_profielen SET profieltekst_kernkrachten_validatie = ${updates.profieltekst_kernkrachten_validatie}, module3_last_updated = NOW() WHERE gebruiker_id = ${userId.toString()}`
      );
    }

    if (updates.profieltekst_cliché_score !== undefined) {
      updatePromises.push(
        sql`UPDATE gebruiker_profielen SET profieltekst_cliché_score = ${updates.profieltekst_cliché_score}, module3_last_updated = NOW() WHERE gebruiker_id = ${userId.toString()}`
      );
    }

    if (updates.trigger_zin_kwaliteit_score !== undefined) {
      updatePromises.push(
        sql`UPDATE gebruiker_profielen SET trigger_zin_kwaliteit_score = ${updates.trigger_zin_kwaliteit_score}, module3_last_updated = NOW() WHERE gebruiker_id = ${userId.toString()}`
      );
    }

    if (updates.profieltekst_proof_count !== undefined) {
      updatePromises.push(
        sql`UPDATE gebruiker_profielen SET profieltekst_proof_count = ${updates.profieltekst_proof_count}, module3_last_updated = NOW() WHERE gebruiker_id = ${userId.toString()}`
      );
    }

    if (updates.profieltekst_hechtings_audit !== undefined) {
      updatePromises.push(
        sql`UPDATE gebruiker_profielen SET profieltekst_hechtings_audit = ${updates.profieltekst_hechtings_audit}, module3_last_updated = NOW() WHERE gebruiker_id = ${userId.toString()}`
      );
    }

    if (updates.module3_completed_at !== undefined) {
      updatePromises.push(
        sql`UPDATE gebruiker_profielen SET module3_completed_at = ${updates.module3_completed_at}, module3_last_updated = NOW() WHERE gebruiker_id = ${userId.toString()}`
      );
    }

    // Always update last_updated if no other updates
    if (updatePromises.length === 0) {
      updatePromises.push(
        sql`UPDATE gebruiker_profielen SET module3_last_updated = NOW() WHERE gebruiker_id = ${userId.toString()}`
      );
    }

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Module 3 progress updated successfully'
    });

  } catch (error) {
    console.error('Module 3 progress update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}