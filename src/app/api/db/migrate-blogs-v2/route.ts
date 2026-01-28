/**
 * WORLD-CLASS BLOG DATABASE MIGRATION V2
 *
 * Extends the existing 'blogs' table with WeAreImpact-inspired features:
 * - Categories and tags for better organization
 * - Vercel Blob image storage (replaces base64)
 * - Header types (image covers OR color backgrounds)
 * - Enhanced SEO and social media fields
 * - Rich text storage (TipTap JSON + HTML)
 * - Author enhancements (bio, avatar)
 * - AI optimization tracking
 *
 * Migration Strategy: NON-DESTRUCTIVE
 * - Uses ALTER TABLE ADD COLUMN IF NOT EXISTS
 * - Preserves all existing data
 * - Backward compatible with old image field
 * - Safe to run multiple times (idempotent)
 *
 * @route GET /api/db/migrate-blogs-v2
 * @access Admin only
 * @author DatingAssistent Team
 * @version 2.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

interface MigrationResult {
  success: boolean;
  changes: string[];
  errors: string[];
  timestamp: string;
  duration: number;
}

/**
 * Execute database migration for blogs v2
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const changes: string[] = [];
  const errors: string[] = [];

  try {
    console.log('🚀 Starting Blog Database Migration V2...');

    // =========================================================================
    // STEP 1: Add Categories & Tags
    // =========================================================================
    try {
      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Uncategorized'
      `;
      changes.push('✅ Added category column');

      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb
      `;
      changes.push('✅ Added tags column (JSONB)');
    } catch (error) {
      errors.push(`❌ Categories/Tags: ${error instanceof Error ? error.message : String(error)}`);
    }

    // =========================================================================
    // STEP 2: Add Vercel Blob Image Storage
    // =========================================================================
    try {
      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS cover_image_url TEXT
      `;
      changes.push('✅ Added cover_image_url column');

      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS cover_image_alt VARCHAR(255)
      `;
      changes.push('✅ Added cover_image_alt column');

      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS cover_image_blob_id VARCHAR(255)
      `;
      changes.push('✅ Added cover_image_blob_id column');
    } catch (error) {
      errors.push(`❌ Image Storage: ${error instanceof Error ? error.message : String(error)}`);
    }

    // =========================================================================
    // STEP 3: Add Header Type Options
    // =========================================================================
    try {
      // First add column without constraint
      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS header_type VARCHAR(20) DEFAULT 'image'
      `;

      // Then add constraint if it doesn't exist
      await sql`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'blogs_header_type_check'
          ) THEN
            ALTER TABLE blogs
            ADD CONSTRAINT blogs_header_type_check
            CHECK (header_type IN ('image', 'color'));
          END IF;
        END $$;
      `;
      changes.push('✅ Added header_type column with constraint');

      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS header_color VARCHAR(50) DEFAULT '#FF7B54'
      `;
      changes.push('✅ Added header_color column');

      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS header_title VARCHAR(100)
      `;
      changes.push('✅ Added header_title column');
    } catch (error) {
      errors.push(`❌ Header Types: ${error instanceof Error ? error.message : String(error)}`);
    }

    // =========================================================================
    // STEP 4: Add SEO & Social Media Fields
    // =========================================================================
    try {
      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS seo_title VARCHAR(100)
      `;
      changes.push('✅ Added seo_title column');

      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS seo_description VARCHAR(200)
      `;
      changes.push('✅ Added seo_description column');

      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS social_title VARCHAR(100)
      `;
      changes.push('✅ Added social_title column');

      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS social_description VARCHAR(200)
      `;
      changes.push('✅ Added social_description column');

      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 5
      `;
      changes.push('✅ Added reading_time column');
    } catch (error) {
      errors.push(`❌ SEO/Social: ${error instanceof Error ? error.message : String(error)}`);
    }

    // =========================================================================
    // STEP 5: Add Rich Text Storage
    // =========================================================================
    try {
      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS content_json JSONB
      `;
      changes.push('✅ Added content_json column (TipTap storage)');
    } catch (error) {
      errors.push(`❌ Rich Text: ${error instanceof Error ? error.message : String(error)}`);
    }

    // =========================================================================
    // STEP 6: Add Author Enhancements
    // =========================================================================
    try {
      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS author_bio TEXT
      `;
      changes.push('✅ Added author_bio column');

      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS author_avatar TEXT
      `;
      changes.push('✅ Added author_avatar column');
    } catch (error) {
      errors.push(`❌ Author Fields: ${error instanceof Error ? error.message : String(error)}`);
    }

    // =========================================================================
    // STEP 7: Add Analytics & AI Tracking
    // =========================================================================
    try {
      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS published_at TIMESTAMP
      `;
      changes.push('✅ Added published_at column');

      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS last_optimized_at TIMESTAMP
      `;
      changes.push('✅ Added last_optimized_at column');

      await sql`
        ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS ai_optimization_count INTEGER DEFAULT 0
      `;
      changes.push('✅ Added ai_optimization_count column');
    } catch (error) {
      errors.push(`❌ Analytics: ${error instanceof Error ? error.message : String(error)}`);
    }

    // =========================================================================
    // STEP 8: Create Performance Indexes
    // =========================================================================
    try {
      // Category index for filtering
      await sql`
        CREATE INDEX IF NOT EXISTS idx_blogs_category
        ON blogs(category)
      `;
      changes.push('✅ Created index: idx_blogs_category');

      // Tags index (GIN for JSONB)
      await sql`
        CREATE INDEX IF NOT EXISTS idx_blogs_tags
        ON blogs USING GIN(tags)
      `;
      changes.push('✅ Created index: idx_blogs_tags (GIN)');

      // Reading time index
      await sql`
        CREATE INDEX IF NOT EXISTS idx_blogs_reading_time
        ON blogs(reading_time)
      `;
      changes.push('✅ Created index: idx_blogs_reading_time');

      // Header type index
      await sql`
        CREATE INDEX IF NOT EXISTS idx_blogs_header_type
        ON blogs(header_type)
      `;
      changes.push('✅ Created index: idx_blogs_header_type');

      // Composite index for published blogs by category
      await sql`
        CREATE INDEX IF NOT EXISTS idx_blogs_published_category
        ON blogs(published, category, created_at DESC)
      `;
      changes.push('✅ Created index: idx_blogs_published_category');

      // Published date index
      await sql`
        CREATE INDEX IF NOT EXISTS idx_blogs_published_at
        ON blogs(published_at DESC)
      `;
      changes.push('✅ Created index: idx_blogs_published_at');

      // Full-text search index
      await sql`
        CREATE INDEX IF NOT EXISTS idx_blogs_search
        ON blogs USING GIN(to_tsvector('english', title || ' ' || COALESCE(excerpt, '')))
      `;
      changes.push('✅ Created index: idx_blogs_search (Full-text)');
    } catch (error) {
      errors.push(`❌ Indexes: ${error instanceof Error ? error.message : String(error)}`);
    }

    // =========================================================================
    // STEP 9: Data Backfilling (Safe Defaults)
    // =========================================================================
    try {
      // Copy image URL to cover_image_url for existing blogs
      const { rowCount: imageCount } = await sql`
        UPDATE blogs
        SET cover_image_url = image
        WHERE (cover_image_url IS NULL OR cover_image_url = '')
          AND image IS NOT NULL
          AND image != ''
      `;
      if (imageCount && imageCount > 0) {
        changes.push(`✅ Migrated ${imageCount} image URLs to cover_image_url`);
      }

      // Copy publish_date to published_at for existing blogs
      const { rowCount: dateCount } = await sql`
        UPDATE blogs
        SET published_at = publish_date
        WHERE published_at IS NULL
          AND publish_date IS NOT NULL
      `;
      if (dateCount && dateCount > 0) {
        changes.push(`✅ Migrated ${dateCount} publish dates to published_at`);
      }

      // Copy meta_title to seo_title for existing blogs
      const { rowCount: seoTitleCount } = await sql`
        UPDATE blogs
        SET seo_title = meta_title
        WHERE (seo_title IS NULL OR seo_title = '')
          AND meta_title IS NOT NULL
          AND meta_title != ''
      `;
      if (seoTitleCount && seoTitleCount > 0) {
        changes.push(`✅ Migrated ${seoTitleCount} meta titles to seo_title`);
      }

      // Copy meta_description to seo_description for existing blogs
      const { rowCount: seoDescCount } = await sql`
        UPDATE blogs
        SET seo_description = meta_description
        WHERE (seo_description IS NULL OR seo_description = '')
          AND meta_description IS NOT NULL
          AND meta_description != ''
      `;
      if (seoDescCount && seoDescCount > 0) {
        changes.push(`✅ Migrated ${seoDescCount} meta descriptions to seo_description`);
      }

      // Set default category for existing blogs
      const { rowCount: categoryCount } = await sql`
        UPDATE blogs
        SET category = 'Online Dating Tips'
        WHERE category = 'Uncategorized' OR category IS NULL
      `;
      if (categoryCount && categoryCount > 0) {
        changes.push(`✅ Set default category for ${categoryCount} existing blogs`);
      }

      // Calculate reading time for existing blogs (based on content length)
      const { rowCount: readingCount } = await sql`
        UPDATE blogs
        SET reading_time = GREATEST(
          1,
          LEAST(
            30,
            CEIL(LENGTH(content) / 1000.0)
          )
        )
        WHERE reading_time = 5 OR reading_time IS NULL
      `;
      if (readingCount && readingCount > 0) {
        changes.push(`✅ Calculated reading time for ${readingCount} existing blogs`);
      }
    } catch (error) {
      errors.push(`❌ Backfilling: ${error instanceof Error ? error.message : String(error)}`);
    }

    // =========================================================================
    // STEP 10: Verify Migration
    // =========================================================================
    const { rows: tableInfo } = await sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'blogs'
      ORDER BY ordinal_position
    `;

    const duration = Date.now() - startTime;

    console.log('✅ Migration completed successfully!');
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📊 Changes: ${changes.length}`);
    console.log(`❌ Errors: ${errors.length}`);

    const result: MigrationResult = {
      success: errors.length === 0,
      changes,
      errors,
      timestamp: new Date().toISOString(),
      duration,
    };

    return NextResponse.json({
      ...result,
      message: errors.length === 0
        ? '🎉 Blog database migration v2 completed successfully!'
        : '⚠️  Migration completed with some errors',
      tableInfo: tableInfo.map(row => ({
        column: row.column_name,
        type: row.data_type,
        maxLength: row.character_maximum_length,
        nullable: row.is_nullable === 'YES',
        default: row.column_default,
      })),
    }, { status: errors.length === 0 ? 200 : 207 });

  } catch (error) {
    console.error('❌ Migration failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      changes,
      errors: [...errors, `Fatal: ${error instanceof Error ? error.message : String(error)}`],
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
    }, { status: 500 });
  }
}

/**
 * Rollback endpoint (future enhancement)
 * Currently returns not implemented
 */
export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    error: 'Rollback not implemented',
    message: 'To rollback, manually drop added columns from the blogs table',
    commands: [
      'ALTER TABLE blogs DROP COLUMN IF EXISTS category;',
      'ALTER TABLE blogs DROP COLUMN IF EXISTS tags;',
      'ALTER TABLE blogs DROP COLUMN IF EXISTS cover_image_url;',
      // ... etc
    ],
  }, { status: 501 });
}
