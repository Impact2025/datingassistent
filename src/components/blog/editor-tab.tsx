"use client";

/**
 * EDITOR TAB - Blog Editor
 *
 * Main content editor with:
 * - Title and excerpt inputs
 * - Auto-generated slug
 * - TipTap rich text WYSIWYG editor
 * - Word count and reading time
 * - DatingAssistent styling with pink gradients
 */

import '@/styles/tiptap.css';
import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Link2,
  ImageIcon,
  Code,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type CreateBlogPostData } from '@/types/blog';
import { cn } from '@/lib/utils';
import { addKennisbankLinksToContent } from '@/lib/seo-utils';

interface EditorTabProps {
  blogData: Partial<CreateBlogPostData>;
  updateBlogData: (updates: Partial<CreateBlogPostData>) => void;
}

export function EditorTab({ blogData, updateBlogData }: EditorTabProps) {
  const { toast } = useToast();

  // =========================================================================
  // TIPTAP EDITOR SETUP
  // =========================================================================

  const editor = useEditor({
    immediatelyRender: false, // Required for SSR/Next.js to avoid hydration mismatches
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-pink-600 hover:text-pink-700 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder: 'Begin met typen van je blog artikel...',
      }),
    ],
    content: blogData.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      updateBlogData({
        content: html,
        reading_time: readingTime,
      });
    },
  });

  // Update editor content when blogData.content changes externally
  useEffect(() => {
    if (editor && blogData.content !== editor.getHTML()) {
      editor.commands.setContent(blogData.content || '');
    }
  }, [blogData.content, editor]);

  // =========================================================================
  // SLUG AUTO-GENERATION
  // =========================================================================

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
  };

  const handleTitleChange = (title: string) => {
    updateBlogData({ title });

    // Auto-generate slug if it's empty or matches the old title's slug
    if (!blogData.slug || blogData.slug === generateSlug(blogData.title || '')) {
      updateBlogData({ slug: generateSlug(title) });
    }
  };

  // =========================================================================
  // TOOLBAR ACTIONS
  // =========================================================================

  const addLink = () => {
    if (!editor) return;

    const url = window.prompt('Voer URL in:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = async () => {
    if (!editor) return;

    const url = window.prompt('Voer afbeelding URL in:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addKennisbankLinks = () => {
    if (!editor) return;

    const currentContent = editor.getHTML();
    const { modifiedContent, linksAdded } = addKennisbankLinksToContent(currentContent);

    if (linksAdded.length === 0) {
      toast({
        title: 'Geen links gevonden',
        description: 'Er zijn geen kennisbank keywords gevonden in de tekst.',
        variant: 'default',
      });
      return;
    }

    editor.commands.setContent(modifiedContent);
    updateBlogData({ content: modifiedContent });

    toast({
      title: `${linksAdded.length} link${linksAdded.length > 1 ? 's' : ''} toegevoegd`,
      description: linksAdded.map(l => `"${l.keyword}" → ${l.title}`).join(', '),
    });
  };

  // =========================================================================
  // STATS
  // =========================================================================

  const wordCount = editor ? editor.getText().trim().split(/\s+/).filter(w => w.length > 0).length : 0;
  const readingTime = blogData.reading_time || Math.max(1, Math.ceil(wordCount / 200));

  // =========================================================================
  // RENDER
  // =========================================================================

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Metadata Card */}
      <Card className="border-pink-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Titel & Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium flex items-center">
              Titel
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Schrijf een pakkende titel..."
              value={blogData.title || ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-xl font-semibold border-gray-300 focus:ring-pink-500"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium flex items-center">
              URL Slug
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">datingassistent.nl/blog/</span>
              <Input
                id="slug"
                placeholder="url-vriendelijke-slug"
                value={blogData.slug || ''}
                onChange={(e) => updateBlogData({ slug: e.target.value })}
                className="flex-1 border-gray-300 focus:ring-pink-500"
              />
            </div>
            <p className="text-xs text-gray-500">
              Wordt automatisch gegenereerd vanuit de titel
            </p>
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt" className="text-sm font-medium flex items-center">
              Excerpt
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="excerpt"
              placeholder="Korte samenvatting van je artikel (1-2 zinnen)..."
              value={blogData.excerpt || ''}
              onChange={(e) => updateBlogData({ excerpt: e.target.value })}
              className="border-gray-300 focus:ring-pink-500 min-h-[80px]"
            />
            <p className="text-xs text-gray-500">
              {blogData.excerpt?.length || 0} karakters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Content Editor Card */}
      <Card className="border-pink-100 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Blog Content
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{wordCount} woorden</span>
              <span>•</span>
              <span>{readingTime} min leestijd</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-lg border border-gray-200">
            {/* Headings */}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('heading', { level: 1 }) && 'bg-pink-100 text-pink-700'
              )}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('heading', { level: 2 }) && 'bg-pink-100 text-pink-700'
              )}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('heading', { level: 3 }) && 'bg-pink-100 text-pink-700'
              )}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </Button>

            <div className="w-px h-8 bg-gray-300 mx-1" />

            {/* Text formatting */}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('bold') && 'bg-pink-100 text-pink-700'
              )}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('italic') && 'bg-pink-100 text-pink-700'
              )}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('code') && 'bg-pink-100 text-pink-700'
              )}
              title="Code"
            >
              <Code className="w-4 h-4" />
            </Button>

            <div className="w-px h-8 bg-gray-300 mx-1" />

            {/* Lists */}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('bulletList') && 'bg-pink-100 text-pink-700'
              )}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('orderedList') && 'bg-pink-100 text-pink-700'
              )}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('blockquote') && 'bg-pink-100 text-pink-700'
              )}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </Button>

            <div className="w-px h-8 bg-gray-300 mx-1" />

            {/* Links & Images */}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={addLink}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('link') && 'bg-pink-100 text-pink-700'
              )}
              title="Add Link"
            >
              <Link2 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={addImage}
              className="h-8 w-8 p-0"
              title="Add Image"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>

            <div className="w-px h-8 bg-gray-300 mx-1" />

            {/* Undo / Redo */}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="h-8 w-8 p-0"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="h-8 w-8 p-0"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>

            <div className="w-px h-8 bg-gray-300 mx-1" />

            {/* AI Kennisbank Links */}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={addKennisbankLinks}
              className="h-8 px-2 gap-1 text-pink-600 hover:bg-pink-100 hover:text-pink-700"
              title="AI: Voeg automatisch interne links naar kennisbank artikelen toe"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium">Links</span>
            </Button>
          </div>

          {/* Editor */}
          <div className="border border-gray-300 rounded-lg min-h-[400px] bg-white">
            <EditorContent editor={editor} />
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500">
            💡 Tip: Gebruik H2 en H3 koppen voor betere leesbaarheid en SEO
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
