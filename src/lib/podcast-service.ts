import { sql } from '@vercel/postgres';

export interface Podcast {
  id: number;
  title: string;
  description: string;
  file_url: string;
  file_size?: number;
  duration?: number;
  published: boolean;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get all podcasts
 */
export async function getAllPodcasts(): Promise<Podcast[]> {
  try {
    const result = await sql`
      SELECT * FROM podcasts ORDER BY created_at DESC
    `;
    return result.rows as Podcast[];
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    // Check if it's a table doesn't exist error
    if (String(error).includes('does not exist')) {
      console.log('Podcasts table does not exist, returning empty array');
      return [];
    }
    throw error;
  }
}

/**
 * Get published podcasts
 */
export async function getPublishedPodcasts(): Promise<Podcast[]> {
  try {
    const result = await sql`
      SELECT * FROM podcasts WHERE published = true ORDER BY published_at DESC
    `;
    return result.rows as Podcast[];
  } catch (error) {
    console.error('Error fetching published podcasts:', error);
    throw error;
  }
}

/**
 * Get podcast by ID
 */
export async function getPodcastById(id: number): Promise<Podcast | null> {
  try {
    const result = await sql`
      SELECT * FROM podcasts WHERE id = ${id}
    `;
    return result.rows.length > 0 ? (result.rows[0] as Podcast) : null;
  } catch (error) {
    console.error(`Error fetching podcast with id ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new podcast
 */
export async function createPodcast(podcast: Omit<Podcast, 'id' | 'created_at' | 'updated_at'>): Promise<Podcast> {
  try {
    // Handle published_at properly - if published is true but published_at is not set, use current timestamp
    let publishedAt = podcast.published_at;
    if (podcast.published && !publishedAt) {
      publishedAt = new Date();
    }
    
    const result = await sql`
      INSERT INTO podcasts (title, description, file_url, file_size, duration, published, published_at)
      VALUES (${podcast.title}, ${podcast.description}, ${podcast.file_url}, ${podcast.file_size}, ${podcast.duration}, ${podcast.published}, ${publishedAt?.toISOString() || null})
      RETURNING *
    `;
    return result.rows[0] as Podcast;
  } catch (error) {
    console.error('Error creating podcast:', error);
    throw error;
  }
}

/**
 * Update podcast
 */
export async function updatePodcast(id: number, updates: Partial<Podcast>): Promise<Podcast> {
  try {
    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_at') {
        // Handle Date objects
        const formattedValue = value instanceof Date ? value.toISOString() : value;
        fields.push(`${key} = $${paramIndex}`);
        values.push(formattedValue);
        paramIndex++;
      }
    }

    values.push(id);
    
    // For dynamic queries, we need to use the query method
    const queryText = `
      UPDATE podcasts 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await sql.query(queryText, values);
    return result.rows[0] as Podcast;
  } catch (error) {
    console.error(`Error updating podcast with id ${id}:`, error);
    throw error;
  }
}

/**
 * Delete podcast
 */
export async function deletePodcast(id: number): Promise<void> {
  try {
    await sql`
      DELETE FROM podcasts WHERE id = ${id}
    `;
  } catch (error) {
    console.error(`Error deleting podcast with id ${id}:`, error);
    throw error;
  }
}

/**
 * Publish podcast
 */
export async function publishPodcast(id: number): Promise<Podcast> {
  try {
    const result = await sql`
      UPDATE podcasts 
      SET published = true, published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0] as Podcast;
  } catch (error) {
    console.error(`Error publishing podcast with id ${id}:`, error);
    throw error;
  }
}

/**
 * Unpublish podcast
 */
export async function unpublishPodcast(id: number): Promise<Podcast> {
  try {
    const result = await sql`
      UPDATE podcasts 
      SET published = false, published_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0] as Podcast;
  } catch (error) {
    console.error(`Error unpublishing podcast with id ${id}:`, error);
    throw error;
  }
}