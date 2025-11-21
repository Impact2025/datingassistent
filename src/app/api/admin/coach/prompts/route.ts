import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { PromptManagementService } from '@/lib/prompt-management-service';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function getCoachIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.userId) {
      return payload.userId as number;
    }

    return null;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const coachId = await getCoachIdFromToken(request);
    if (!coachId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'templates':
        const templates = PromptManagementService.getPromptTemplates();
        return NextResponse.json(templates);

      case 'custom':
        const customPrompts = await PromptManagementService.getCustomPrompts(coachId);
        return NextResponse.json(customPrompts);

      case 'stats':
        const stats = await PromptManagementService.getPromptUsageStats(coachId);
        return NextResponse.json(stats);

      default:
        // Return both templates and custom prompts
        const templatesData = PromptManagementService.getPromptTemplates();
        const customPromptsData = await PromptManagementService.getCustomPrompts(coachId);
        return NextResponse.json({
          templates: templatesData,
          customPrompts: customPromptsData
        });
    }
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const coachId = await getCoachIdFromToken(request);
    if (!coachId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create-custom':
        const { templateId, customizations } = data;
        const customPrompt = PromptManagementService.createCustomPrompt(templateId, customizations, coachId);
        const savedPrompt = await PromptManagementService.saveCustomPrompt(customPrompt);
        return NextResponse.json({
          success: true,
          prompt: savedPrompt
        });

      case 'update':
        const { promptId, updates } = data;
        await PromptManagementService.updateCustomPrompt(promptId, updates);
        return NextResponse.json({ success: true });

      case 'delete':
        const { promptId: deleteId } = data;
        await PromptManagementService.deleteCustomPrompt(deleteId, coachId);
        return NextResponse.json({ success: true });

      case 'execute':
        const { promptId: executeId, variables } = data;
        const result = await PromptManagementService.executePrompt(executeId, variables);
        return NextResponse.json({
          success: true,
          result
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available: create-custom, update, delete, execute' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing prompt request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}