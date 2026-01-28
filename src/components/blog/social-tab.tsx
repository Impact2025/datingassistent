"use client";

/**
 * SOCIAL MEDIA TAB - Blog Editor
 *
 * Social media optimization:
 * - Social title (max 70 characters)
 * - Social description (max 200 characters)
 * - Platform preview cards (Facebook, Twitter, LinkedIn)
 * - Hashtag suggestions
 * - DatingAssistent styling with pink gradients
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Share2, Sparkles, CheckCircle2, AlertCircle, Facebook, Twitter, Linkedin } from 'lucide-react';
import { type CreateBlogPostData } from '@/types/blog';
import { cn } from '@/lib/utils';

interface SocialMediaTabProps {
  blogData: Partial<CreateBlogPostData>;
  updateBlogData: (updates: Partial<CreateBlogPostData>) => void;
}

export function SocialMediaTab({ blogData, updateBlogData }: SocialMediaTabProps) {
  // =========================================================================
  // CHARACTER LIMITS
  // =========================================================================

  const SOCIAL_TITLE_MAX = 70;
  const SOCIAL_DESCRIPTION_MAX = 200;

  const socialTitleLength = blogData.social_title?.length || 0;
  const socialDescriptionLength = blogData.social_description?.length || 0;

  const titleStatus = socialTitleLength === 0 ? 'empty' : socialTitleLength <= SOCIAL_TITLE_MAX ? 'good' : 'warning';
  const descriptionStatus = socialDescriptionLength === 0 ? 'empty' : socialDescriptionLength <= SOCIAL_DESCRIPTION_MAX ? 'good' : 'warning';

  // =========================================================================
  // AUTO-FILL FROM BLOG DATA
  // =========================================================================

  const autoFillSocial = () => {
    updateBlogData({
      social_title: blogData.title?.substring(0, SOCIAL_TITLE_MAX) || '',
      social_description: blogData.excerpt?.substring(0, SOCIAL_DESCRIPTION_MAX) || '',
    });
  };

  // =========================================================================
  // DISPLAY DATA
  // =========================================================================

  const displayImage = blogData.cover_image_url || 'https://placehold.co/1200x630/FF7B54/ffffff?text=DatingAssistent';
  const displayTitle = blogData.social_title || blogData.title || 'Blog Titel';
  const displayDescription = blogData.social_description || blogData.excerpt || 'Beschrijving van je blog artikel...';
  const displayUrl = `datingassistent.nl/blog/${blogData.slug || 'artikel'}`;

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* Social Media Meta Tags Card */}
      <Card className="border-coral-100 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Share2 className="w-5 h-5 mr-2 text-coral-500" />
                Social Media Tags
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Optimaliseer hoe je artikel wordt gedeeld op social media
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={autoFillSocial}
              className="border-coral-200 text-coral-700 hover:bg-coral-50"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Auto-vullen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Social Title */}
          <div className="space-y-2">
            <Label htmlFor="social_title" className="text-sm font-medium">
              Social Media Titel
            </Label>
            <Input
              id="social_title"
              placeholder="Pakkende titel voor social media (max 70 karakters)"
              value={blogData.social_title || ''}
              onChange={(e) => updateBlogData({ social_title: e.target.value })}
              className={cn(
                'border-gray-300 focus:ring-coral-500',
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
                {socialTitleLength} / {SOCIAL_TITLE_MAX}
              </span>
            </div>
          </div>

          {/* Social Description */}
          <div className="space-y-2">
            <Label htmlFor="social_description" className="text-sm font-medium">
              Social Media Omschrijving
            </Label>
            <Textarea
              id="social_description"
              placeholder="Beschrijving die verschijnt bij het delen (max 200 karakters)"
              value={blogData.social_description || ''}
              onChange={(e) => updateBlogData({ social_description: e.target.value })}
              className={cn(
                'border-gray-300 focus:ring-coral-500 min-h-[100px]',
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
                {socialDescriptionLength} / {SOCIAL_DESCRIPTION_MAX}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Previews */}
      <div className="grid grid-cols-1 gap-6">
        {/* Facebook Preview */}
        <Card className="border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-md font-semibold flex items-center">
              <Facebook className="w-5 h-5 mr-2 text-blue-600" />
              Facebook Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {/* Image */}
              {blogData.header_type === 'image' && blogData.cover_image_url ? (
                <img
                  src={blogData.cover_image_url}
                  alt="Facebook preview"
                  className="w-full aspect-[1.91/1] object-cover"
                />
              ) : blogData.header_type === 'color' ? (
                <div
                  className="w-full aspect-[1.91/1] flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${blogData.header_color || '#FF7B54'}, ${adjustColor(blogData.header_color || '#FF7B54', -20)})`,
                  }}
                >
                  <h1 className="text-3xl font-bold text-white drop-shadow-2xl px-8 text-center">
                    {displayTitle}
                  </h1>
                </div>
              ) : (
                <div className="w-full aspect-[1.91/1] bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <p className="text-gray-400">Geen afbeelding</p>
                </div>
              )}
              {/* Content */}
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <div className="text-xs text-gray-500 uppercase mb-1">{displayUrl}</div>
                <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1">
                  {displayTitle}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {displayDescription}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Twitter/X Preview */}
        <Card className="border-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-md font-semibold flex items-center">
              <Twitter className="w-5 h-5 mr-2 text-gray-900" />
              X (Twitter) Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
              {/* Image */}
              {blogData.header_type === 'image' && blogData.cover_image_url ? (
                <img
                  src={blogData.cover_image_url}
                  alt="Twitter preview"
                  className="w-full aspect-[2/1] object-cover"
                />
              ) : blogData.header_type === 'color' ? (
                <div
                  className="w-full aspect-[2/1] flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${blogData.header_color || '#FF7B54'}, ${adjustColor(blogData.header_color || '#FF7B54', -20)})`,
                  }}
                >
                  <h1 className="text-2xl font-bold text-white drop-shadow-2xl px-8 text-center">
                    {displayTitle}
                  </h1>
                </div>
              ) : (
                <div className="w-full aspect-[2/1] bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <p className="text-gray-400">Geen afbeelding</p>
                </div>
              )}
              {/* Content */}
              <div className="p-3 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-0.5">
                  {displayTitle}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-1 mb-1">
                  {displayDescription}
                </p>
                <div className="text-xs text-gray-500 flex items-center">
                  <span className="truncate">{displayUrl}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LinkedIn Preview */}
        <Card className="border-blue-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-md font-semibold flex items-center">
              <Linkedin className="w-5 h-5 mr-2 text-blue-700" />
              LinkedIn Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-gray-200 rounded overflow-hidden bg-white">
              {/* Image */}
              {blogData.header_type === 'image' && blogData.cover_image_url ? (
                <img
                  src={blogData.cover_image_url}
                  alt="LinkedIn preview"
                  className="w-full aspect-[1.91/1] object-cover"
                />
              ) : blogData.header_type === 'color' ? (
                <div
                  className="w-full aspect-[1.91/1] flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${blogData.header_color || '#FF7B54'}, ${adjustColor(blogData.header_color || '#FF7B54', -20)})`,
                  }}
                >
                  <h1 className="text-3xl font-bold text-white drop-shadow-2xl px-8 text-center">
                    {displayTitle}
                  </h1>
                </div>
              ) : (
                <div className="w-full aspect-[1.91/1] bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <p className="text-gray-400">Geen afbeelding</p>
                </div>
              )}
              {/* Content */}
              <div className="p-3 bg-white">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                  {displayTitle}
                </h3>
                <div className="text-xs text-gray-500">{displayUrl}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Media Tips Card */}
      <Card className="border-coral-100 shadow-lg bg-gradient-to-br from-coral-50 to-coral-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-coral-600" />
            Social Media Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>
                <strong>Titel:</strong> Gebruik emotionele triggers en getallen voor meer engagement
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>
                <strong>Afbeelding:</strong> Gebruik hoge kwaliteit visuals (1200x630px voor Facebook/LinkedIn)
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>
                <strong>Beschrijving:</strong> Voeg een call-to-action toe om clicks te maximaliseren
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>
                <strong>Tags:</strong> Gebruik maximaal 3-5 relevante hashtags per platform
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Helper function to darken/lighten a hex color
 */
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
