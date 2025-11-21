-- Reviews table for storing user testimonials
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) DEFAULT 'Gebruiker',
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  avatar TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(published);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Insert default reviews (the ones currently hardcoded)
INSERT INTO reviews (name, role, content, rating, avatar, published, created_at) VALUES
('Marieke', 'Gebruiker', 'Dankzij DatingAssistent heb ik mijn partner gevonden! De AI-gestuurde tips waren echt waardevol.', 5, 'https://placehold.co/100x100/1c1c2e/e0e0e0?text=M', true, NOW()),
('Thomas', 'Gebruiker', 'Ik was sceptisch, maar de openingszinnen die ik kreeg waren echt effectief. Meer matches dan ooit!', 4, 'https://placehold.co/100x100/1c1c2e/e0e0e0?text=T', true, NOW()),
('Sanne', 'Gebruiker', 'De profielhulp heeft mijn dating succes compleet veranderd. Absoluut de investering waard!', 5, 'https://placehold.co/100x100/1c1c2e/e0e0e0?text=S', true, NOW()),
('Lars', 'Gebruiker', 'De AI chat coach heeft mijn conversaties naar een heel nieuw niveau getild. Geweldig!', 5, 'https://placehold.co/100x100/1c1c2e/e0e0e0?text=L', true, NOW()),
('Emma', 'Gebruiker', 'Eindelijk een dating app die echt werkt! De foto analyse was een game changer.', 5, 'https://placehold.co/100x100/1c1c2e/e0e0e0?text=E', true, NOW()),
('Daan', 'Gebruiker', 'Ik heb nu veel meer zelfvertrouwen bij het daten. De tips zijn goud waard!', 5, 'https://placehold.co/100x100/1c1c2e/e0e0e0?text=D', true, NOW())
ON CONFLICT DO NOTHING;