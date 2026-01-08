/**
 * SEO Utility Functions
 */

// =========================================================================
// KENNISBANK ARTICLES CONFIGURATION
// =========================================================================

export interface KennisbankArticle {
  url: string;
  title: string;
  keywords: string[];
}

export const KENNISBANK_ARTICLES: KennisbankArticle[] = [
  // Pillar: Dating Burnout
  {
    url: '/kennisbank/dating-burnout',
    title: 'Dating burnout herkennen en overwinnen',
    keywords: ['dating burnout', 'burnout', 'uitgeput', 'moe van daten', 'swipe moeheid', 'swipe fatigue']
  },
  {
    url: '/kennisbank/dating-burnout/slow-dating',
    title: 'Slow dating: het bewuste alternatief',
    keywords: ['slow dating', 'bewust daten', 'minder swipen', 'kwaliteit boven kwantiteit']
  },
  {
    url: '/kennisbank/dating-burnout/paradox-van-keuze',
    title: 'De paradox van keuze',
    keywords: ['paradox van keuze', 'keuzestress', 'te veel keuze', 'decision fatigue', 'keuzeverlamming']
  },
  {
    url: '/kennisbank/dating-burnout/eerste-date-angst',
    title: 'Eerste date angst overwinnen',
    keywords: ['eerste date angst', 'date angst', 'zenuwachtig', 'nerveus voor date', 'dating anxiety']
  },
  // Pillar: Ghosting
  {
    url: '/kennisbank/ghosting',
    title: 'Ghosting en moderne datingtermen',
    keywords: ['ghosting', 'geghostd', 'verdwijnen', 'geen reactie meer', 'contact verbroken']
  },
  {
    url: '/kennisbank/ghosting/verwerken',
    title: 'Ghosting verwerken: 5 stappen',
    keywords: ['ghosting verwerken', 'omgaan met ghosting', 'afwijzing verwerken']
  },
  // Pillar: Daten als Introvert
  {
    url: '/kennisbank/daten-als-introvert',
    title: 'Daten als introvert: je stille kracht',
    keywords: ['introvert', 'introversie', 'stille', 'energie', 'sociaal uitgeput', 'alleen tijd']
  },
  // Pillar: Hechtingsstijlen
  {
    url: '/kennisbank/hechtingsstijlen',
    title: 'Hechtingsstijlen en dating',
    keywords: ['hechtingsstijl', 'hechtingsstijlen', 'hechting', 'attachment', 'veilige hechting', 'onveilige hechting']
  },
  {
    url: '/kennisbank/hechtingsstijlen/bindingsangst',
    title: 'Bindingsangst: symptomen en oplossingen',
    keywords: ['bindingsangst', 'bang voor commitment', 'bang om te binden', 'vermijdend']
  },
  // Pillar: Opnieuw Daten
  {
    url: '/kennisbank/opnieuw-daten',
    title: 'Opnieuw daten na scheiding',
    keywords: ['opnieuw daten', 'na scheiding', 'na relatie', 'herintreder', '40+', '50+', 'gescheiden']
  },
  // Pillar: Profiel Optimaliseren
  {
    url: '/kennisbank/profiel-optimaliseren',
    title: 'Profieloptimalisatie: de wetenschap achter matches',
    keywords: ['profiel optimaliseren', 'dating profiel', 'profiel verbeteren', 'meer matches', 'profiel foto', 'bio schrijven']
  },
  // Glossary: Datingtermen
  {
    url: '/kennisbank/datingtermen',
    title: 'Moderne datingtermen: de complete glossary',
    keywords: [
      'breadcrumbing', 'benching', 'situationship', 'love bombing',
      'orbiting', 'zombieing', 'cuffing season', 'catfishing',
      'slow fading', 'submarining', 'cushioning', 'roaching'
    ]
  }
];

// =========================================================================
// AI INTERNAL LINKING FUNCTION
// =========================================================================

export interface LinkSuggestion {
  keyword: string;
  url: string;
  title: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Find kennisbank link opportunities in content
 * Returns suggestions without modifying the content
 */
export function findKennisbankLinkOpportunities(content: string): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = [];
  const contentLower = content.toLowerCase();
  const usedUrls = new Set<string>();

  // Sort keywords by length (longer first) to match more specific terms first
  const allKeywords: { keyword: string; article: KennisbankArticle }[] = [];

  KENNISBANK_ARTICLES.forEach(article => {
    article.keywords.forEach(keyword => {
      allKeywords.push({ keyword: keyword.toLowerCase(), article });
    });
  });

  // Sort by keyword length descending
  allKeywords.sort((a, b) => b.keyword.length - a.keyword.length);

  // Find each keyword in content (only first occurrence per article)
  allKeywords.forEach(({ keyword, article }) => {
    // Skip if we already have a link to this article
    if (usedUrls.has(article.url)) return;

    // Find the keyword in content (word boundary match)
    const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'gi');
    const match = regex.exec(content);

    if (match) {
      // Check if this position overlaps with an existing suggestion
      const overlaps = suggestions.some(s =>
        (match.index >= s.startIndex && match.index < s.endIndex) ||
        (match.index + match[0].length > s.startIndex && match.index + match[0].length <= s.endIndex)
      );

      if (!overlaps) {
        suggestions.push({
          keyword: match[0], // Use original case from content
          url: article.url,
          title: article.title,
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
        usedUrls.add(article.url);
      }
    }
  });

  // Sort suggestions by position in text
  suggestions.sort((a, b) => a.startIndex - b.startIndex);

  return suggestions;
}

/**
 * Apply internal links to HTML content
 * Creates anchor tags for matched keywords
 */
export function addKennisbankLinksToContent(content: string): {
  modifiedContent: string;
  linksAdded: LinkSuggestion[];
} {
  const suggestions = findKennisbankLinkOpportunities(content);

  if (suggestions.length === 0) {
    return { modifiedContent: content, linksAdded: [] };
  }

  // Build new content with links, working backwards to preserve indices
  let modifiedContent = content;
  const reversedSuggestions = [...suggestions].reverse();

  reversedSuggestions.forEach(suggestion => {
    const before = modifiedContent.slice(0, suggestion.startIndex);
    const keyword = modifiedContent.slice(suggestion.startIndex, suggestion.endIndex);
    const after = modifiedContent.slice(suggestion.endIndex);

    // Check if keyword is already inside a link
    const beforeLower = before.toLowerCase();
    const lastAnchorOpen = beforeLower.lastIndexOf('<a ');
    const lastAnchorClose = beforeLower.lastIndexOf('</a>');

    // If there's an unclosed anchor tag before this position, skip
    if (lastAnchorOpen > lastAnchorClose) {
      return;
    }

    // Create the link
    const link = `<a href="${suggestion.url}" class="text-pink-600 hover:text-pink-700 underline" title="${suggestion.title}">${keyword}</a>`;
    modifiedContent = before + link + after;
  });

  return { modifiedContent, linksAdded: suggestions };
}

// Helper function to escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to check content length and provide suggestions
export function analyzeContentLength(content: string): {
  wordCount: number;
  readingTime: number;
  recommendations: string[];
} {
  // Remove HTML tags for accurate word count
  const textContent = content.replace(/<[^>]*>/g, ' ');
  const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Average reading speed: 200 words per minute
  const readingTime = Math.ceil(wordCount / 200);
  
  const recommendations: string[] = [];
  
  if (wordCount < 300) {
    recommendations.push('Content is too short. Aim for at least 300 words for basic SEO value.');
  } else if (wordCount < 1000) {
    recommendations.push('Consider expanding content to 1000+ words for better SEO performance.');
  } else {
    recommendations.push('Good content length for SEO.');
  }
  
  if (readingTime > 10) {
    recommendations.push('Consider breaking up long content with subheadings and bullet points for better readability.');
  }
  
  return {
    wordCount,
    readingTime,
    recommendations
  };
}

// Function to suggest internal linking opportunities
export function suggestInternalLinks(
  content: string, 
  currentSlug: string,
  allSlugs: string[]
): string[] {
  const suggestions: string[] = [];
  const contentLower = content.toLowerCase();
  
  // Common dating-related keywords that might benefit from internal linking
  const keywords = [
    'datingprofiel', 'profiel', 'match', 'matches', 'dating app', 
    ' datingsite', 'online daten', 'relatie', 'gesprekken', 'berichten'
  ];
  
  keywords.forEach(keyword => {
    if (contentLower.includes(keyword)) {
      // Find slugs that might be relevant (simplified logic)
      const relevantSlugs = allSlugs.filter(slug => 
        slug !== currentSlug && 
        (slug.includes(keyword.replace(/\s+/g, '-')) || 
         keyword.includes(slug.split('-')[0]))
      );
      
      if (relevantSlugs.length > 0) {
        suggestions.push(`Consider linking "${keyword}" to: ${relevantSlugs[0]}`);
      }
    }
  });
  
  return suggestions;
}

// Function to analyze keyword usage
export function analyzeKeywords(
  title: string,
  content: string,
  keywords: string[]
): {
  titleKeywords: string[];
  contentKeywords: string[];
  missingKeywords: string[];
  recommendations: string[];
} {
  const contentLower = content.toLowerCase();
  const titleLower = title.toLowerCase();
  
  const titleKeywords = keywords.filter(keyword => 
    titleLower.includes(keyword.toLowerCase())
  );
  
  const contentKeywords = keywords.filter(keyword => 
    contentLower.includes(keyword.toLowerCase())
  );
  
  const missingKeywords = keywords.filter(keyword => 
    !titleLower.includes(keyword.toLowerCase()) && 
    !contentLower.includes(keyword.toLowerCase())
  );
  
  const recommendations: string[] = [];
  
  if (titleKeywords.length === 0) {
    recommendations.push('No target keywords found in title. Include primary keywords in the title.');
  }
  
  if (contentKeywords.length === 0) {
    recommendations.push('No target keywords found in content. Include keywords naturally throughout the content.');
  }
  
  if (missingKeywords.length > 0) {
    recommendations.push(`Consider incorporating these keywords: ${missingKeywords.join(', ')}`);
  }
  
  // Check keyword density (aim for 1-2%)
  const textContent = content.replace(/<[^>]*>/g, ' ');
  const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  keywords.forEach(keyword => {
    const keywordCount = (contentLower.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    const density = (keywordCount / wordCount) * 100;
    
    if (density > 3) {
      recommendations.push(`Keyword "${keyword}" may be overused. Current density: ${density.toFixed(2)}%`);
    }
  });
  
  return {
    titleKeywords,
    contentKeywords,
    missingKeywords,
    recommendations
  };
}

// Function to check for proper heading structure
export function analyzeHeadings(content: string): {
  headingStructure: { level: number; text: string }[];
  recommendations: string[];
} {
  const headings: { level: number; text: string }[] = [];
  const recommendations: string[] = [];
  
  // Extract headings using regex
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      text: match[2].replace(/<[^>]*>/g, '').trim()
    });
  }
  
  // Check heading structure
  if (headings.length === 0) {
    recommendations.push('No headings found. Add proper heading structure (H1, H2, H3, etc.)');
  } else {
    const h1Headings = headings.filter(h => h.level === 1);
    if (h1Headings.length === 0) {
      recommendations.push('Missing H1 heading. Include one main H1 heading.');
    } else if (h1Headings.length > 1) {
      recommendations.push('Multiple H1 headings found. Use only one H1 per page.');
    }
    
    // Check for logical heading hierarchy
    let lastLevel = 0;
    for (const heading of headings) {
      if (heading.level > lastLevel + 1 && lastLevel !== 0) {
        recommendations.push(`Skipping heading levels: H${lastLevel} to H${heading.level}. Use sequential heading levels.`);
        break;
      }
      lastLevel = heading.level;
    }
  }
  
  return {
    headingStructure: headings,
    recommendations
  };
}