export function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://datingassistent.nl';

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      // Organization
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "DatingAssistent",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`,
          "width": 512,
          "height": 512
        },
        "sameAs": [
          "https://www.facebook.com/datingassistent",
          "https://www.instagram.com/datingassistent",
          "https://twitter.com/datingassistent"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Customer Service",
          "email": "info@datingassistent.nl",
          "availableLanguage": "nl"
        },
        "foundingDate": "2024",
        "description": "DatingAssistent is jouw persoonlijke AI datingcoach voor betere matches en succesvollere dates."
      },

      // Website
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": "DatingAssistent - AI Dating Coach",
        "description": "Professionele AI dating coaching met 10 tools voor profiel optimalisatie, gesprekken en date planning. Gratis proberen!",
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "inLanguage": "nl-NL",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${baseUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },

      // Main WebPage
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/#webpage`,
        "url": baseUrl,
        "name": "DatingAssistent – AI Dating Coach voor betere matches",
        "isPartOf": {
          "@id": `${baseUrl}/#website`
        },
        "about": {
          "@id": `${baseUrl}/#organization`
        },
        "description": "AI dating coaching met profiel analyse, chat coach, date planner en meer. 89% meer matches gegarandeerd.",
        "inLanguage": "nl-NL",
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": baseUrl
            }
          ]
        }
      },

      // Main Service
      {
        "@type": "Service",
        "@id": `${baseUrl}/#service`,
        "serviceType": "Dating Coaching",
        "provider": {
          "@id": `${baseUrl}/#organization`
        },
        "areaServed": {
          "@type": "Country",
          "name": "Netherlands"
        },
        "name": "AI Dating Coaching Service",
        "description": "Complete AI-gedreven dating coaching service met 10 professionele tools voor profiel optimalisatie, gesprekstraining en date planning.",
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "EUR",
          "lowPrice": "3.95",
          "highPrice": "69.50",
          "offers": [
            {
              "@type": "Offer",
              "name": "Sociaal Pakket",
              "price": "3.95",
              "priceCurrency": "EUR",
              "description": "Basis dating coaching voor sociale doeleinden",
              "priceValidUntil": "2025-12-31"
            },
            {
              "@type": "Offer",
              "name": "Core Pakket",
              "price": "24.50",
              "priceCurrency": "EUR",
              "description": "Complete dating coaching met AI ondersteuning",
              "priceValidUntil": "2025-12-31"
            },
            {
              "@type": "Offer",
              "name": "Pro Pakket",
              "price": "39.50",
              "priceCurrency": "EUR",
              "description": "Geavanceerde dating coaching met premium features",
              "priceValidUntil": "2025-12-31"
            },
            {
              "@type": "Offer",
              "name": "Premium Pakket",
              "price": "69.50",
              "priceCurrency": "EUR",
              "description": "All-inclusive dating coaching met onbeperkte mogelijkheden",
              "priceValidUntil": "2025-12-31"
            }
          ]
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "127",
          "bestRating": "5",
          "worstRating": "1"
        }
      },

      // Individual Tools as SoftwareApplications
      {
        "@type": "SoftwareApplication",
        "@id": `${baseUrl}/#profile-coach`,
        "name": "Profiel Coach",
        "description": "AI-gedreven profiel analyse en optimalisatie voor maximale aantrekkingskracht",
        "url": `${baseUrl}/dashboard`,
        "applicationCategory": "DatingApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "EUR"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "89"
        }
      },

      {
        "@type": "SoftwareApplication",
        "@id": `${baseUrl}/#conversation-coach`,
        "name": "Gesprek Coach",
        "description": "Real-time AI feedback tijdens dating gesprekken voor betere connecties",
        "url": `${baseUrl}/dashboard`,
        "applicationCategory": "CommunicationApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "EUR"
        }
      },

      {
        "@type": "SoftwareApplication",
        "@id": `${baseUrl}/#date-planner`,
        "name": "Date Planner",
        "description": "Professionele date ideeën en logistieke planning voor geslaagde ontmoetingen",
        "url": `${baseUrl}/date-planner`,
        "applicationCategory": "PlanningApplication",
        "operatingSystem": "Web Browser"
      },

      // FAQ Schema
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Hoe werkt DatingAssistent?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DatingAssistent gebruikt geavanceerde AI om je dating profiel te analyseren, gesprekken te verbeteren en date ideeën te genereren. Al onze tools zijn gratis te proberen."
            }
          },
          {
            "@type": "Question",
            "name": "Is mijn data veilig?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Ja, al je data wordt versleuteld opgeslagen en we delen nooit persoonlijke informatie met derden. GDPR compliant en Nederlandse servers."
            }
          },
          {
            "@type": "Question",
            "name": "Voor welke dating apps werkt het?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Onze tools werken voor alle populaire dating apps zoals Tinder, Bumble, Hinge, Inner Circle, Lexa en meer. De tips zijn universeel toepasbaar."
            }
          }
        ]
      },

      // Breadcrumb Navigation
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Dashboard",
            "item": `${baseUrl}/dashboard`
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
