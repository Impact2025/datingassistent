/**
 * SEO Utility Functions
 */

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