"use client";

/**
 * SEO TAB - Blog Editor
 *
 * SEO optimization fields:
 * - SEO title (max 60 characters)
 * - SEO description (max 155 characters)
 * - Focus keyword
 * - Character counters
 * - AI optimization suggestions
 * - DatingAssistent styling with pink gradients
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { type CreateBlogPostData } from '@/types/blog';
import { cn } from '@/lib/utils';

interface SEOTabProps {
  blogData: Partial<CreateBlogPostData>;
  updateBlogData: (updates: Partial<CreateBlogPostData>) => void;
}

export function SEOTab({ blogData, updateBlogData }: SEOTabProps) {
  // =========================================================================
  // CHARACTER LIMITS
  // =========================================================================

  const SEO_TITLE_MAX = 60;
  const SEO_DESCRIPTION_MAX = 155;

  const seoTitleLength = blogData.seo_title?.length || 0;
  const seoDescriptionLength = blogData.seo_description?.length || 0;

  const titleStatus = seoTitleLength === 0 ? 'empty' : seoTitleLength <= SEO_TITLE_MAX ? 'good' : 'warning';
  const descriptionStatus = seoDescriptionLength === 0 ? 'empty' : seoDescriptionLength <= SEO_DESCRIPTION_MAX ? 'good' : 'warning';

  // =========================================================================
  // AUTO-FILL FROM BLOG DATA
  // =========================================================================

  const autoFillSEO = () => {
    updateBlogData({
      seo_title: blogData.title?.substring(0, SEO_TITLE_MAX) || '',
      seo_description: blogData.excerpt?.substring(0, SEO_DESCRIPTION_MAX) || '',
    });
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* SEO Meta Tags Card */}
      <Card className="border-pink-100 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Search className="w-5 h-5 mr-2 text-pink-500" />
                SEO Meta Tags
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Optimaliseer je artikel voor zoekmachines
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={autoFillSEO}
              className="border-pink-200 text-pink-700 hover:bg-pink-50"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Auto-vullen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SEO Title */}
          <div className="space-y-2">
            <Label htmlFor="seo_title" className="text-sm font-medium">
              SEO Titel
            </Label>
            <Input
              id="seo_title"
              placeholder="Optimale titel voor Google (max 60 karakters)"
              value={blogData.seo_title || ''}
              onChange={(e) => updateBlogData({ seo_title: e.target.value })}
              className={cn(
                'border-gray-300 focus:ring-pink-500',
                titleStatus === 'warning' && 'border-orange-300 focus:ring-orange-500'
              )}
            />
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {titleStatus === 'good' && (
                  <span className="flex items-center text-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Goede lengte
                  </span>
                )}
                {titleStatus === 'warning' && (
                  <span className="flex items-center text-orange-600">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Te lang (wordt afgekapt)
                  </span>
                )}
                {titleStatus === 'empty' && (
                  <span className="text-gray-500">
                    Laat leeg om artikel titel te gebruiken
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'font-medium',
                  titleStatus === 'good' && 'text-green-600',
                  titleStatus === 'warning' && 'text-orange-600',
                  titleStatus === 'empty' && 'text-gray-500'
                )}
              >
                {seoTitleLength} / {SEO_TITLE_MAX}
              </span>
            </div>
          </div>

          {/* SEO Description */}
          <div className="space-y-2">
            <Label htmlFor="seo_description" className="text-sm font-medium">
              SEO Omschrijving
            </Label>
            <Textarea
              id="seo_description"
              placeholder="Korte omschrijving die verschijnt in Google zoekresultaten (max 155 karakters)"
              value={blogData.seo_description || ''}
              onChange={(e) => updateBlogData({ seo_description: e.target.value })}
              className={cn(
                'border-gray-300 focus:ring-pink-500 min-h-[100px]',
                descriptionStatus === 'warning' && 'border-orange-300 focus:ring-orange-500'
              )}
            />
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {descriptionStatus === 'good' && (
                  <span className="flex items-center text-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Goede lengte
                  </span>
                )}
                {descriptionStatus === 'warning' && (
                  <span className="flex items-center text-orange-600">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Te lang (wordt afgekapt)
                  </span>
                )}
                {descriptionStatus === 'empty' && (
                  <span className="text-gray-500">
                    Laat leeg om excerpt te gebruiken
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'font-medium',
                  descriptionStatus === 'good' && 'text-green-600',
                  descriptionStatus === 'warning' && 'text-orange-600',
                  descriptionStatus === 'empty' && 'text-gray-500'
                )}
              >
                {seoDescriptionLength} / {SEO_DESCRIPTION_MAX}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Preview Card */}
      <Card className="border-pink-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Google Zoekresultaat Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            {/* Google Search Result Mock */}
            <div className="space-y-1">
              <div className="text-xs text-gray-600">
                datingassistent.nl › blog › {blogData.slug || 'artikel-slug'}
              </div>
              <h3 className="text-xl text-blue-600 hover:underline cursor-pointer">
                {blogData.seo_title || blogData.title || 'Blog Titel'}
              </h3>
              <p className="text-sm text-gray-700">
                {blogData.seo_description || blogData.excerpt || 'Excerpt van je blog artikel wordt hier weergegeven in de Google zoekresultaten...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Tips Card */}
      <Card className="border-pink-100 shadow-lg bg-gradient-to-br from-pink-50 to-pink-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-pink-600" />
            SEO Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>
                <strong>SEO Titel:</strong> Gebruik je primaire zoekwoord en houd het onder 60 karakters
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>
                <strong>Omschrijving:</strong> Schrijf een pakkende beschrijving met een call-to-action (max 155 karakters)
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>
                <strong>URL Slug:</strong> Gebruik korte, beschrijvende woorden gescheiden door koppeltekens
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>
                <strong>Keywords:</strong> Gebruik je zoekwoorden natuurlijk in de content, niet geforceerd
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
