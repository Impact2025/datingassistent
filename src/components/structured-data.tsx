import { ReactNode } from 'react';

interface StructuredDataProps {
  type?: 'website' | 'organization' | 'course' | 'article' | 'faq' | 'review' | 'service';
  data?: any;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export function StructuredData({ type = 'website', data, breadcrumbs }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://datingassistent.nl';

  // Core organization data - always included
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DatingAssistent",
    "url": baseUrl,
    "logo": `${baseUrl}/images/dating-assistent-header.png`,
    "description": "Jouw persoonlijke AI datingcoach die je helpt om sneller een echte match te vinden. Professionele dating advies, relatie tips en AI-gedreven inzichten voor singles.",
    "foundingDate": "2024",
    "sameAs": [
      // Add social media when available
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "info@datingassistent.nl",
      "contactType": "Klantenservice",
      "availableLanguage": "Dutch"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Netherlands"
    },
    "serviceType": "Dating Coaching",
    "priceRange": "€€"
  };

  // Website data with search functionality
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DatingAssistent - AI Dating Coach",
    "url": baseUrl,
    "description": "Professionele AI datingcoach voor singles. Leer effectieve dating strategieën, verbeter je profiel en vind sneller je match.",
    "inLanguage": "nl-NL",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/blog/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DatingAssistent",
      "url": baseUrl
    }
  };

  // Service/Product data for the dating assistant
  const serviceData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "AI Dating Coaching",
    "description": "Persoonlijke AI-gedreven dating coaching met professionele tips, profiel optimalisatie en relatie advies.",
    "provider": {
      "@type": "Organization",
      "name": "DatingAssistent"
    },
    "serviceType": "Dating Coaching",
    "areaServed": {
      "@type": "Country",
      "name": "Netherlands"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Dating Coaching Pakketten",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Basis Pakket",
            "description": "Essentiële dating tips en profiel advies"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Premium Pakket",
            "description": "Uitgebreide AI coaching met persoonlijke strategie"
          }
        }
      ]
    }
  };

  // Course structured data for dating courses
  const courseData = data ? {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": data.title || "Dating Cursus",
    "description": data.description || "Leer effectieve dating strategieën",
    "provider": {
      "@type": "Organization",
      "name": "DatingAssistent"
    },
    "courseMode": "online",
    "inLanguage": "nl-NL",
    "educationalLevel": "Beginner to Advanced",
    "teaches": data.skills || ["Dating strategieën", "Profiel optimalisatie", "Communicatie skills"],
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "instructor": {
        "@type": "Person",
        "name": "DatingAssistent AI Coach"
      }
    }
  } : null;

  // Article/BlogPost structured data
  const articleData = data ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": data.title,
    "description": data.description,
    "author": {
      "@type": "Organization",
      "name": "DatingAssistent"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DatingAssistent",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/dating-assistent-header.png`
      }
    },
    "datePublished": data.publishDate || data.createdAt,
    "dateModified": data.updatedAt || data.publishDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": data.url || `${baseUrl}/blog/${data.slug}`
    },
    "articleSection": data.category || "Dating Tips",
    "keywords": data.tags || ["dating", "relaties", "liefde"]
  } : null;

  // FAQ structured data
  const faqData = data ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faqs?.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    })) || []
  } : null;

  // Review/Testimonial structured data
  const reviewData = data ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "DatingAssistent AI Coaching",
    "description": "AI-gedreven dating coaching service",
    "review": data.reviews?.map((review: any) => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "reviewBody": review.comment
    })) || [],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": data.averageRating || "4.8",
      "reviewCount": data.reviewCount || "150"
    }
  } : null;

  // Breadcrumb navigation
  const breadcrumbData = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  } : null;

  // Collect all applicable structured data
  const structuredData = [];

  // Always include organization and website data
  structuredData.push(organizationData, websiteData, serviceData);

  // Add type-specific data
  switch (type) {
    case 'course':
      if (courseData) structuredData.push(courseData);
      break;
    case 'article':
      if (articleData) structuredData.push(articleData);
      break;
    case 'faq':
      if (faqData) structuredData.push(faqData);
      break;
    case 'review':
      if (reviewData) structuredData.push(reviewData);
      break;
  }

  // Add breadcrumbs if provided
  if (breadcrumbData) {
    structuredData.push(breadcrumbData);
  }

  return (
    <>
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
        />
      ))}
    </>
  );
}

// Specialized components for different page types
export function CourseStructuredData({ course }: { course: any }) {
  return <StructuredData type="course" data={course} />;
}

export function ArticleStructuredData({ article }: { article: any }) {
  return <StructuredData type="article" data={article} />;
}

export function FAQStructuredData({ faqs }: { faqs: any[] }) {
  return <StructuredData type="faq" data={{ faqs }} />;
}

export function ReviewStructuredData({ reviews, averageRating, reviewCount }: {
  reviews?: any[];
  averageRating?: string;
  reviewCount?: string;
}) {
  return (
    <StructuredData
      type="review"
      data={{ reviews, averageRating, reviewCount }}
    />
  );
}

export function BreadcrumbStructuredData({ breadcrumbs }: {
  breadcrumbs: Array<{ name: string; url: string }>
}) {
  return <StructuredData breadcrumbs={breadcrumbs} />;
}