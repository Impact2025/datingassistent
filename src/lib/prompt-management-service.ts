import { sql } from '@vercel/postgres';

export interface AIPrompt {
  id: number;
  name: string;
  category: PromptCategory;
  description: string;
  promptText: string;
  variables: PromptVariable[];
  isActive: boolean;
  usageCount: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
  required: boolean;
  defaultValue?: any;
}

export type PromptCategory =
  | 'client_communication'
  | 'report_generation'
  | 'goal_setting'
  | 'motivation'
  | 'feedback'
  | 'assessment'
  | 'custom';

export interface PromptTemplate {
  id: string;
  name: string;
  category: PromptCategory;
  description: string;
  promptText: string;
  variables: PromptVariable[];
  exampleUsage: string;
}

export class PromptManagementService {
  // Predefined prompt templates
  private static readonly PROMPT_TEMPLATES: PromptTemplate[] = [
    {
      id: 'motivational-message',
      name: 'Motiverend Bericht',
      category: 'motivation',
      description: 'Persoonlijk motiverend bericht gebaseerd op client voortgang',
      promptText: `Je bent een ervaren dating coach. Schrijf een motiverend bericht voor een client gebaseerd op hun recente voortgang.

Client naam: {clientName}
Recente successen: {recentSuccesses}
Huidige uitdagingen: {currentChallenges}
Doelen voor komende week: {weeklyGoals}

Schrijf een warm, motiverend bericht dat:
1. De successen erkent
2. Aanmoedigt door te gaan
3. Concrete tips geeft voor de uitdagingen
4. Positief afsluit met vertrouwen in hun kunnen

Houd het bericht tussen 150-250 woorden.`,
      variables: [
        { name: 'clientName', type: 'string', description: 'Naam van de client', required: true },
        { name: 'recentSuccesses', type: 'array', description: 'Lijst van recente successen', required: false },
        { name: 'currentChallenges', type: 'array', description: 'Huidige uitdagingen', required: false },
        { name: 'weeklyGoals', type: 'array', description: 'Doelen voor komende week', required: false }
      ],
      exampleUsage: 'Voor Jan die net zijn eerste date heeft gehad'
    },
    {
      id: 'goal-feedback',
      name: 'Doel Feedback',
      category: 'goal_setting',
      description: 'Constructieve feedback op gestelde doelen',
      promptText: `Analyseer de volgende doelen die een client heeft gesteld en geef professionele feedback.

Client doelen:
{clientGoals}

Huidige voortgang:
{currentProgress}

Geef feedback die:
1. Positieve aspecten van de doelen benoemt
2. Realistische aanpassingen suggereert indien nodig
3. Concrete actiepunten geeft
4. Motiveert om door te gaan

Structureer je antwoord als een coachend gesprek.`,
      variables: [
        { name: 'clientGoals', type: 'array', description: 'Lijst van client doelen', required: true },
        { name: 'currentProgress', type: 'string', description: 'Huidige voortgang status', required: false }
      ],
      exampleUsage: 'Feedback op dating doelen van een nieuwe client'
    },
    {
      id: 'progress-report',
      name: 'Voortgangsrapport',
      category: 'report_generation',
      description: 'Gedetailleerd rapport over client voortgang',
      promptText: `Genereer een uitgebreid voortgangsrapport voor een dating coaching client.

Client informatie:
Naam: {clientName}
Coaching duur: {coachingDuration} weken
Totale sessies: {totalSessions}

Voortgangsdata:
{sessionNotes}
{goalProgress}
{assessmentResults}

Schrijf een professioneel rapport dat bevat:
1. Samenvatting van voortgang
2. Belangrijkste successen
3. Gebieden voor verbetering
4. Aanbevelingen voor volgende fase
5. Motivatie en aanmoediging

Houd het rapport tussen 400-600 woorden.`,
      variables: [
        { name: 'clientName', type: 'string', description: 'Naam van de client', required: true },
        { name: 'coachingDuration', type: 'number', description: 'Duur van coaching in weken', required: true },
        { name: 'totalSessions', type: 'number', description: 'Totaal aantal sessies', required: true },
        { name: 'sessionNotes', type: 'array', description: 'Notities van sessies', required: false },
        { name: 'goalProgress', type: 'string', description: 'Voortgang op doelen', required: false },
        { name: 'assessmentResults', type: 'string', description: 'Resultaten van assessments', required: false }
      ],
      exampleUsage: 'Maandelijks voortgangsrapport voor bestaande client'
    },
    {
      id: 'client-assessment',
      name: 'Client Assessment',
      category: 'assessment',
      description: 'Beoordeling van client readiness en behoeften',
      promptText: `Beoordeel een nieuwe dating coaching client en geef een uitgebreide assessment.

Client achtergrond:
{clientBackground}

Dating ervaring:
{datingExperience}

Doelen:
{statedGoals}

Uitdagingen:
{identifiedChallenges}

Geef een assessment dat bevat:
1. Sterke punten van de client
2. Ontwikkelgebieden
3. Readiness voor dating coaching
4. Aanbevolen aanpak
5. Verwachte tijdslijn voor resultaten
6. Potentiële obstakels

Wees eerlijk maar bemoedigend in je beoordeling.`,
      variables: [
        { name: 'clientBackground', type: 'string', description: 'Achtergrond informatie', required: true },
        { name: 'datingExperience', type: 'string', description: 'Dating ervaring niveau', required: true },
        { name: 'statedGoals', type: 'array', description: 'Gestelde doelen', required: true },
        { name: 'identifiedChallenges', type: 'array', description: 'Geïdentificeerde uitdagingen', required: false }
      ],
      exampleUsage: 'Intake assessment voor nieuwe client'
    }
  ];

  /**
   * Get all available prompt templates
   */
  static getPromptTemplates(): PromptTemplate[] {
    return this.PROMPT_TEMPLATES;
  }

  /**
   * Get prompt templates by category
   */
  static getPromptTemplatesByCategory(category: PromptCategory): PromptTemplate[] {
    return this.PROMPT_TEMPLATES.filter(template => template.category === category);
  }

  /**
   * Create a custom prompt from a template
   */
  static createCustomPrompt(
    templateId: string,
    customizations: {
      name: string;
      description?: string;
      customPromptText?: string;
      variableOverrides?: Partial<PromptVariable>[];
    },
    coachId: number
  ): AIPrompt {
    const template = this.PROMPT_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const customPrompt: AIPrompt = {
      id: Date.now(), // Temporary ID, will be replaced by database
      name: customizations.name,
      category: template.category,
      description: customizations.description || template.description,
      promptText: customizations.customPromptText || template.promptText,
      variables: customizations.variableOverrides ?
        template.variables.map(v => ({
          ...v,
          ...customizations.variableOverrides!.find(o => o.name === v.name)
        })) :
        template.variables,
      isActive: true,
      usageCount: 0,
      successRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: coachId
    };

    return customPrompt;
  }

  /**
   * Save a custom prompt to database
   */
  static async saveCustomPrompt(prompt: AIPrompt): Promise<AIPrompt> {
    try {
      const result = await sql`
        INSERT INTO ai_prompts (
          name, category, description, prompt_text, variables,
          is_active, usage_count, success_rate, created_by
        )
        VALUES (
          ${prompt.name}, ${prompt.category}, ${prompt.description},
          ${prompt.promptText}, ${JSON.stringify(prompt.variables)},
          ${prompt.isActive}, ${prompt.usageCount}, ${prompt.successRate},
          ${prompt.createdBy}
        )
        RETURNING id, created_at, updated_at
      `;

      return {
        ...prompt,
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      };
    } catch (error) {
      console.error('Error saving custom prompt:', error);
      throw error;
    }
  }

  /**
   * Get all custom prompts for a coach
   */
  static async getCustomPrompts(coachId: number): Promise<AIPrompt[]> {
    try {
      const result = await sql`
        SELECT * FROM ai_prompts
        WHERE created_by = ${coachId}
        ORDER BY updated_at DESC
      `;

      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        description: row.description,
        promptText: row.prompt_text,
        variables: JSON.parse(row.variables || '[]'),
        isActive: row.is_active,
        usageCount: row.usage_count,
        successRate: row.success_rate,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdBy: row.created_by
      }));
    } catch (error) {
      console.error('Error fetching custom prompts:', error);
      return [];
    }
  }

  /**
   * Update a custom prompt
   */
  static async updateCustomPrompt(promptId: number, updates: Partial<AIPrompt>): Promise<void> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        values.push(updates.description);
      }
      if (updates.promptText !== undefined) {
        updateFields.push(`prompt_text = $${paramIndex++}`);
        values.push(updates.promptText);
      }
      if (updates.variables !== undefined) {
        updateFields.push(`variables = $${paramIndex++}`);
        values.push(JSON.stringify(updates.variables));
      }
      if (updates.isActive !== undefined) {
        updateFields.push(`is_active = $${paramIndex++}`);
        values.push(updates.isActive);
      }

      if (updateFields.length === 0) return;

      updateFields.push(`updated_at = NOW()`);

      const query = `
        UPDATE ai_prompts
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
      `;
      values.push(promptId);

      await sql.query(query, values);
    } catch (error) {
      console.error('Error updating custom prompt:', error);
      throw error;
    }
  }

  /**
   * Delete a custom prompt
   */
  static async deleteCustomPrompt(promptId: number, coachId: number): Promise<void> {
    try {
      await sql`
        DELETE FROM ai_prompts
        WHERE id = ${promptId} AND created_by = ${coachId}
      `;
    } catch (error) {
      console.error('Error deleting custom prompt:', error);
      throw error;
    }
  }

  /**
   * Execute a prompt with given variables
   */
  static async executePrompt(promptId: number | string, variables: Record<string, any>): Promise<string> {
    try {
      let prompt: AIPrompt | PromptTemplate;

      // Check if it's a template ID or custom prompt ID
      if (typeof promptId === 'string' && !promptId.match(/^\d+$/)) {
        // It's a template ID
        const template = this.PROMPT_TEMPLATES.find(t => t.id === promptId);
        if (!template) {
          throw new Error(`Template ${promptId} not found`);
        }
        prompt = template;
      } else {
        // It's a custom prompt ID
        const result = await sql`
          SELECT * FROM ai_prompts WHERE id = ${promptId} AND is_active = true
        `;

        if (result.rows.length === 0) {
          throw new Error(`Custom prompt ${promptId} not found or inactive`);
        }

        const row = result.rows[0];
        prompt = {
          id: row.id,
          name: row.name,
          category: row.category,
          description: row.description,
          promptText: row.prompt_text,
          variables: JSON.parse(row.variables || '[]'),
          isActive: row.is_active,
          usageCount: row.usage_count,
          successRate: row.success_rate,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          createdBy: row.created_by
        };
      }

      // Validate required variables
      const missingVars = prompt.variables
        .filter(v => v.required && !variables[v.name])
        .map(v => v.name);

      if (missingVars.length > 0) {
        throw new Error(`Missing required variables: ${missingVars.join(', ')}`);
      }

      // Fill in the prompt template
      let filledPrompt = prompt.promptText;
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{${key}}`;
        if (filledPrompt.includes(placeholder)) {
          filledPrompt = filledPrompt.replace(new RegExp(placeholder, 'g'), String(value));
        }
      }

      // Update usage statistics
      if (typeof promptId === 'number') {
        await sql`
          UPDATE ai_prompts
          SET usage_count = usage_count + 1
          WHERE id = ${promptId}
        `;
      }

      return filledPrompt;
    } catch (error) {
      console.error('Error executing prompt:', error);
      throw error;
    }
  }

  /**
   * Get prompt usage statistics
   */
  static async getPromptUsageStats(coachId: number): Promise<any> {
    try {
      const result = await sql`
        SELECT
          category,
          COUNT(*) as total_prompts,
          SUM(usage_count) as total_usage,
          AVG(success_rate) as avg_success_rate
        FROM ai_prompts
        WHERE created_by = ${coachId}
        GROUP BY category
      `;

      return {
        byCategory: result.rows,
        totalPrompts: result.rows.reduce((sum, row) => sum + parseInt(row.total_prompts), 0),
        totalUsage: result.rows.reduce((sum, row) => sum + parseInt(row.total_usage), 0)
      };
    } catch (error) {
      console.error('Error getting prompt usage stats:', error);
      return { byCategory: [], totalPrompts: 0, totalUsage: 0 };
    }
  }
}