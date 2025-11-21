-- Add image_url and video_url columns to course_modules table
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS video_url TEXT;
