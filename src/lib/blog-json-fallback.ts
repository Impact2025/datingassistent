// Statically imported blog data — no fs.readFileSync needed (works on Vercel serverless)
import blogListData from '@/data/blog-list-data';

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

export function getAllBlogsFromJson(): BlogListItem[] {
  if (!cachedBlogs) {
    cachedBlogs = (blogListData as BlogListItem[]).filter((b: BlogListItem) => b.published !== false);
  }
  return cachedBlogs;
}

export function getBlogBySlugFromJson(slug: string): BlogListItem | null {
  const blogs = getAllBlogsFromJson();
  return blogs.find((b) => b.slug === slug) || null;
}
