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
  // Normalized SEO fields (read from metaTitle/metaDescription in raw JSON)
  seo_title?: string;
  seo_description?: string;
  // Raw JSON fields (some entries use these instead of seo_*)
  metaTitle?: string;
  metaDescription?: string;
}

let cachedBlogs: BlogListItem[] | null = null;

function normalizeBlog(b: BlogListItem): BlogListItem {
  // Map metaTitle → seo_title, metaDescription → seo_description
  // JSON data uses 'metaTitle'/'metaDescription', but the page code expects 'seo_title'/'seo_description'
  return {
    ...b,
    seo_title: b.seo_title || b.metaTitle,
    seo_description: b.seo_description || b.metaDescription,
  };
}

export function getAllBlogsFromJson(): BlogListItem[] {
  if (!cachedBlogs) {
    cachedBlogs = (blogListData as BlogListItem[]).map(normalizeBlog);
  }
  return cachedBlogs;
}

export function getBlogBySlugFromJson(slug: string): BlogListItem | null {
  const blogs = getAllBlogsFromJson();
  return blogs.find((b) => b.slug === slug) || null;
}
