import { config } from 'dotenv';
config();

import '@/ai/flows/generate-conversation-starters.ts';
import '@/ai/flows/suggest-matching-platforms.ts';
import '@/ai/flows/refine-dating-profile.ts';
import '@/ai/flows/analyze-profile-photo.ts';
import '@/ai/flows/assess-conversation-safety.ts';
import '@/ai/flows/chat-with-coach.ts';
import '@/ai/flows/generate-blog-post.ts';
import '@/ai/flows/article-to-blog.ts';
