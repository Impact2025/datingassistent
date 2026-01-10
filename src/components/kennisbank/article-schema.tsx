import type { KennisbankArticle } from '@/lib/kennisbank';

interface ArticleSchemaProps {
  article: KennisbankArticle;
  url: string;
}

export function ArticleSchema({ article, url }: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Organization',
      name: article.author || 'DatingAssistent',
      url: 'https://datingassistent.nl',
      logo: {
        '@type': 'ImageObject',
        url: 'https://datingassistent.nl/logo.png',
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'DatingAssistent',
      url: 'https://datingassistent.nl',
      logo: {
        '@type': 'ImageObject',
        url: 'https://datingassistent.nl/logo.png',
      },
    },
    datePublished: article.date,
    dateModified: article.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: article.pillar || 'Dating',
    keywords: article.keywords?.join(', ') || '',
    wordCount: article.content.split(/\s+/).length,
    timeRequired: `PT${article.readingTime}M`,
    inLanguage: 'nl',
    isAccessibleForFree: true,
    ...(article.featured_image && {
      image: {
        '@type': 'ImageObject',
        url: article.featured_image,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQSchemaProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQSchema({ questions }: FAQSchemaProps) {
  if (questions.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Combined schema component for kennisbank articles
export function KennisbankArticleSchema({
  article,
  breadcrumbs,
}: {
  article: KennisbankArticle;
  breadcrumbs: Array<{ name: string; url: string }>;
}) {
  const baseUrl = 'https://datingassistent.nl';
  const articleUrl = `${baseUrl}/kennisbank/${article.slug}`;

  // Extract FAQ-style content from Iris-tips (blockquotes with tips)
  const faqItems: Array<{ question: string; answer: string }> = [];
  const tipRegex = />\s*💡\s*\*\*Iris-tip:\*\*\s*(.+?)(?=\n\n|\n>|$)/gs;
  let match;
  while ((match = tipRegex.exec(article.content)) !== null) {
    faqItems.push({
      question: 'Wat is een tip van Iris?',
      answer: match[1].trim(),
    });
  }

  return (
    <>
      <ArticleSchema article={article} url={articleUrl} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: baseUrl },
          ...breadcrumbs.map((b) => ({
            name: b.name,
            url: `${baseUrl}${b.url}`,
          })),
          { name: article.title, url: articleUrl },
        ]}
      />
      {faqItems.length > 0 && <FAQSchema questions={faqItems} />}
    </>
  );
}
