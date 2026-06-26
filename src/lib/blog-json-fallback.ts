import * as fs from 'fs';
import * as path from 'path';

interface BlogListItem {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  published: boolean;
  publish_date?: string;
  created_at?: string;
  image?: string;
  category?: string;
  tags?: string[];
  keywords?: string[];
  author?: string;
  cover_image_url?: string;
  cover_image_alt?: string;
  seo_title?: string;
  seo_description?: string;
}

let cachedBlogs: BlogListItem[] | null = null;

function parseBlogListJson(): BlogListItem[] {
  try {
    const filePath = path.join(process.cwd(), 'blog_list.json');
    if (!fs.existsSync(filePath)) return [];
    const rawBuffer = fs.readFileSync(filePath);
    let rawText = rawBuffer.toString('utf16le');
    if (rawText.charCodeAt(0) === 0xFEFF) {
      rawText = rawText.slice(1);
    }
    const data = JSON.parse(rawText);
    if (data.success && Array.isArray(data.blogs)) {
      return data.blogs;
    }
    return [];
  } catch {
    return [];
  }
}

export function getAllBlogsFromJson(): BlogListItem[] {
  if (!cachedBlogs) {
    cachedBlogs = parseBlogListJson();
  }
  return cachedBlogs!.filter((b) => b.published !== false);
}

export function getBlogBySlugFromJson(slug: string): BlogListItem | null {
  const blogs = getAllBlogsFromJson();
  return blogs.find((b) => b.slug === slug) || null;
}
