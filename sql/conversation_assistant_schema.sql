-- GespreksAssistent Database Schema
-- Professional conversation analysis and coaching system

-- Conversation Analyses Table
CREATE TABLE IF NOT EXISTS conversation_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_type VARCHAR(50) NOT NULL, -- 'chat_app', 'date_in_person', 'whatsapp'
    platform VARCHAR(50), -- 'tinder', 'bumble', 'hinge', 'whatsapp', etc.
    raw_content TEXT NOT NULL,
    analysis_data JSONB NOT NULL, -- NLP analysis results
    metrics JSONB NOT NULL, -- vibe, energy, flirt_balance, etc.
    insights JSONB, -- actionable insights and recommendations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation Scripts Library
CREATE TABLE IF NOT EXISTS conversation_scripts (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'openers', 'teasing', 'compliments', 'deepening', 'closers'
    style VARCHAR(50) NOT NULL, -- 'playful', 'confident', 'romantic', 'humorous', 'direct'
    script_text TEXT NOT NULL,
    context_description TEXT,
    success_rate DECIMAL(3,2), -- 0.00-1.00
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation Sessions (Real-time strategy)
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL, -- 'strategy_advice', 'tension_analysis', 'proposal_review'
    context_data JSONB NOT NULL, -- current conversation state
    advice_given JSONB, -- AI recommendations provided
    user_feedback JSONB, -- user ratings and comments
    outcome VARCHAR(50), -- 'successful', 'neutral', 'unsuccessful', 'pending'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Tension Metrics History
CREATE TABLE IF NOT EXISTS tension_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id INTEGER REFERENCES conversation_analyses(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES conversation_sessions(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- 'flirt_level', 'engagement', 'comfort', 'interest'
    metric_value DECIMAL(3,2) NOT NULL, -- 0.00-1.00
    context_snapshot JSONB, -- conversation state at time of measurement
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposal Analyses
CREATE TABLE IF NOT EXISTS proposal_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proposal_text TEXT NOT NULL,
    analysis_result JSONB NOT NULL, -- clarity, tone, attractiveness, success_probability
    alternative_versions JSONB, -- 3-5 improved versions
    user_rating INTEGER, -- 1-5 stars
    was_used BOOLEAN DEFAULT false,
    outcome VARCHAR(50), -- 'accepted', 'declined', 'pending', 'not_sent'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation Progress Tracking
CREATE TABLE IF NOT EXISTS conversation_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_area VARCHAR(50) NOT NULL, -- 'chat_analysis', 'date_conversation', 'script_usage', 'tension_reading'
    current_level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    achievements JSONB, -- unlocked achievements
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_analyses_user_id ON conversation_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_analyses_created_at ON conversation_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_scripts_category_style ON conversation_scripts(category, style);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user_id ON conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tension_metrics_user_id ON tension_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_proposal_analyses_user_id ON proposal_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_progress_user_id ON conversation_progress(user_id);

-- RLS Policies for data privacy
ALTER TABLE conversation_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tension_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_progress ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can access own conversation analyses" ON conversation_analyses
    FOR ALL USING (user_id = current_user_id());

CREATE POLICY "Users can access own conversation sessions" ON conversation_sessions
    FOR ALL USING (user_id = current_user_id());

CREATE POLICY "Users can access own tension metrics" ON tension_metrics
    FOR ALL USING (user_id = current_user_id());

CREATE POLICY "Users can access own proposal analyses" ON proposal_analyses
    FOR ALL USING (user_id = current_user_id());

CREATE POLICY "Users can access own conversation progress" ON conversation_progress
    FOR ALL USING (user_id = current_user_id());

-- Scripts are readable by all authenticated users
CREATE POLICY "Authenticated users can read active scripts" ON conversation_scripts
    FOR SELECT USING (is_active = true);

-- Insert initial script data
INSERT INTO conversation_scripts (category, style, script_text, context_description, success_rate) VALUES
-- Openers
('openers', 'playful', 'Als ik je vertel dat ik net een puppy heb gered uit een brandende dierentuin, geloof je me dan?', 'Speelse opener voor eerste berichten', 0.78),
('openers', 'confident', 'Ik zag je profiel en dacht: eindelijk iemand die eruitziet alsof ze weet hoe je een goed gesprek voert.', 'Zelfverzekerde opener met compliment', 0.82),
('openers', 'romantic', 'Er zijn dagen dat ik denk dat het universum ons bij elkaar heeft gebracht. Vandaag is zo''n dag.', 'Romantische opener met diepgang', 0.75),

-- Teasing
('teasing', 'playful', 'Volgens mij ben jij het type dat altijd de beste verhalen heeft. Bewijs me maar eens ongelijk!', 'Lichtvoetige uitdaging om gesprek te starten', 0.85),
('teasing', 'humorous', 'Ik wed dat jij meer huisdieren hebt dan ik. Ik heb er nul, dus je wint sowieso.', 'Humoristische uitdaging', 0.80),

-- Compliments
('compliments', 'sincere', 'Je glimlach op die foto straalt zoveel warmte uit. Dat is precies wat ik zoek in een gesprek.', 'Oprecht compliment over uitstraling', 0.88),
('compliments', 'specific', 'Die foto van je met die hond? Perfect. Iemand die van dieren houdt heeft automatisch mijn aandacht.', 'Specifiek compliment over gedeelde interesse', 0.91),

-- Deepening Questions
('deepening', 'curious', 'Wat is het leukste avontuur dat je ooit hebt beleefd? Ik ben benieuwd naar je verhalen!', 'Nieuwsgerige vraag om verhalen op te halen', 0.86),
('deepening', 'meaningful', 'Als je één ding kon veranderen aan de wereld, wat zou dat dan zijn? Ik ben benieuwd naar wat je belangrijk vindt.', 'Betekenisvolle vraag voor diepgang', 0.79),

-- Closers
('closers', 'confident', 'Ik vind dit gesprek echt leuk verlopen. Zullen we elkaar snel ontmoeten voor een kop koffie?', 'Zelfverzekerde afsluiting met voorstel', 0.77),
('closers', 'playful', 'Volgens mij hebben we genoeg gepraat. Tijd om elkaar in het echt te ontmoeten, vind je niet?', 'Speelse overgang naar date', 0.81)
ON CONFLICT DO NOTHING;

-- Insert initial conversation progress tracking
INSERT INTO conversation_progress (user_id, skill_area, current_level, experience_points)
SELECT
    u.id,
    unnest(ARRAY['chat_analysis', 'date_conversation', 'script_usage', 'tension_reading']) as skill_area,
    1 as current_level,
    0 as experience_points
FROM users u
ON CONFLICT DO NOTHING;