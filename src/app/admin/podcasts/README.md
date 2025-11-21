# Podcast Management System

This directory contains the admin interface for managing podcasts in the DatingAssistent application.

## Features

- Upload M4A audio files (podcasts created with NotebookLM)
- Manage podcast metadata (title, description, etc.)
- Publish/unpublish podcasts
- View and delete existing podcasts

## File Structure

```
podcasts/
├── page.tsx              # Upload new podcast page
├── manage/
│   └── page.tsx          # Manage existing podcasts
├── layout.tsx            # Layout and authentication wrapper
└── README.md             # This file
```

## API Endpoints

- `GET /api/admin/podcasts` - Get all podcasts
- `POST /api/admin/podcasts` - Create a new podcast
- `GET /api/admin/podcasts/[id]` - Get a specific podcast
- `PUT /api/admin/podcasts/[id]` - Update a podcast
- `DELETE /api/admin/podcasts/[id]` - Delete a podcast
- `POST /api/admin/podcasts/[id]/publish` - Publish/unpublish a podcast

## Database Schema

The podcasts are stored in the `podcasts` table with the following structure:

```sql
CREATE TABLE IF NOT EXISTS podcasts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  duration INTEGER, -- in seconds
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Future Improvements

1. Integrate with Firebase Storage for actual file uploads
2. Add audio file validation
3. Implement audio transcoding for different formats
4. Add podcast cover image support
5. Create public podcast feed/RSS generation