'use client';

import { Share2, Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description: string;
}

export default function SocialShareButtons({ url, title }: SocialShareButtonsProps) {
  const { toast } = useToast();

  const handleShare = (platform: string) => {
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({ title: 'Link gekopieerd!', description: 'De link is naar je klembord gekopieerd' });
        return;
    }

    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
      <span className="text-sm font-medium text-gray-700 flex items-center">
        <Share2 className="mr-2 h-4 w-4" />
        Delen:
      </span>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleShare('facebook')}
        className="hover:bg-blue-50 hover:text-blue-600"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleShare('twitter')}
        className="hover:bg-sky-50 hover:text-sky-600"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleShare('linkedin')}
        className="hover:bg-blue-50 hover:text-blue-700"
      >
        <Linkedin className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleShare('copy')}
        className="hover:bg-gray-100"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
