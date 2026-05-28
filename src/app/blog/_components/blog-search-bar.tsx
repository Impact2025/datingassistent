'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface BlogSearchBarProps {
  defaultQuery?: string;
}

export function BlogSearchBar({ defaultQuery }: BlogSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery || '');

  const navigate = (q: string) => {
    if (q.trim()) {
      router.push(`/blog?q=${encodeURIComponent(q.trim())}`);
    } else {
      router.push('/blog');
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto pt-4">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 mt-2 h-5 w-5 text-gray-400" />
      <Input
        type="text"
        placeholder="Zoek artikelen over dating..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && navigate(query)}
        className="pl-12 pr-12 py-4 text-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 h-14 rounded-full shadow-sm focus:ring-2 focus:ring-coral-500 focus:border-transparent"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 mt-2 h-10 w-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={() => { setQuery(''); navigate(''); }}
        >
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
