/**
 * Content Quality Analyzer
 * Analyzes blog content for SEO and readability quality
 */

interface ContentQualityReport {
  readabilityScore: number;
  seoScore: number;
  contentLength: number;
  headingStructure: HeadingAnalysis;
  keywordAnalysis: KeywordAnalysis;
  internalLinks: number;
  externalLinks: number;
  imageCount: number;
  recommendations: string[];
}

interface HeadingAnalysis {
  hasH1: boolean;
  headingHierarchy: boolean;
  headingCount: number;
}

interface KeywordAnalysis {
  keywordDensity: number;
  keywordsFound: string[];
  missingKeywords: string[];
}

export class ContentQualityAnalyzer {
  private content: string;
  private title: string;
  private keywords: string[];

  constructor(content: string, title: string, keywords: string[]) {
    this.content = content;
    this.title = title;
    this.keywords = keywords;
  }

  public analyze(): ContentQualityReport {
    return {
      readabilityScore: this.calculateReadabilityScore(),
      seoScore: this.calculateSEOScore(),
      contentLength: this.getContentLength(),
      headingStructure: this.analyzeHeadings(),
      keywordAnalysis: this.analyzeKeywords(),
      internalLinks: this.countInternalLinks(),
      externalLinks: this.countExternalLinks(),
      imageCount: this.countImages(),
      recommendations: this.generateRecommendations()
    };
  }

  private getContentLength(): number {
    const textContent = this.content.replace(/<[^>]*>/g, ' ');
    return textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private calculateReadabilityScore(): number {
    const wordCount = this.getContentLength();
    const sentenceCount = this.content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const syllableCount = this.estimateSyllables();
    
    // Simplified Flesch Reading Ease formula adapted for Dutch
    if (sentenceCount === 0 || wordCount === 0) return 0;
    
    const avgWordsPerSentence = wordCount / sentenceCount;
    const avgSyllablesPerWord = syllableCount / wordCount;
    
    // Dutch readability formula (simplified)
    const score = 206.835 - (0.77 * avgWordsPerSentence) - (0.93 * avgSyllablesPerWord);
    
    // Normalize to 0-100 scale
    return Math.max(0, Math.min(100, score));
  }

  private estimateSyllables(): number {
    const textContent = this.content.replace(/<[^>]*>/g, ' ');
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    
    let syllableCount = 0;
    words.forEach(word => {
      // Simplified syllable counting for Dutch
      const vowels = word.match(/[aeiouyAEIOUY]/g);
      syllableCount += vowels ? Math.max(1, vowels.length) : 1;
    });
    
    return syllableCount;
  }

  private calculateSEOScore(): number {
    let score = 0;
    const recommendations: string[] = [];

    // Content length scoring (0-20 points)
    const wordCount = this.getContentLength();
    if (wordCount >= 1000) {
      score += 20;
    } else if (wordCount >= 500) {
      score += 15;
    } else if (wordCount >= 300) {
      score += 10;
    } else {
      score += 5;
    }

    // Keyword analysis scoring (0-30 points)
    const keywordAnalysis = this.analyzeKeywords();
    if (keywordAnalysis.keywordsFound.length > 0) {
      score += 20;
      if (keywordAnalysis.keywordDensity >= 0.5 && keywordAnalysis.keywordDensity <= 2.5) {
        score += 10;
      }
    }

    // Heading structure scoring (0-20 points)
    const headingAnalysis = this.analyzeHeadings();
    if (headingAnalysis.hasH1) score += 10;
    if (headingAnalysis.headingHierarchy) score += 10;

    // Link analysis scoring (0-15 points)
    const internalLinks = this.countInternalLinks();
    const externalLinks = this.countExternalLinks();
    if (internalLinks >= 3) score += 10;
    if (externalLinks >= 2) score += 5;

    // Image analysis scoring (0-15 points)
    const imageCount = this.countImages();
    if (imageCount >= 1) score += 15;

    return Math.min(100, score);
  }

  private analyzeHeadings(): HeadingAnalysis {
    const headings: { level: number; text: string }[] = [];
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
    let match;

    while ((match = headingRegex.exec(this.content)) !== null) {
      headings.push({
        level: parseInt(match[1]),
        text: match[2].replace(/<[^>]*>/g, '').trim()
      });
    }

    const hasH1 = headings.some(h => h.level === 1);
    const headingCount = headings.length;

    // Check heading hierarchy (H1, then H2, then H3, etc.)
    let headingHierarchy = true;
    let lastLevel = 0;
    for (const heading of headings) {
      if (heading.level > lastLevel + 1 && lastLevel !== 0) {
        headingHierarchy = false;
        break;
      }
      lastLevel = heading.level;
    }

    return {
      hasH1,
      headingHierarchy,
      headingCount
    };
  }

  private analyzeKeywords(): KeywordAnalysis {
    const contentLower = this.content.toLowerCase();
    const titleLower = this.title.toLowerCase();
    
    const keywordsFound: string[] = [];
    const missingKeywords: string[] = [];

    this.keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      if (contentLower.includes(keywordLower) || titleLower.includes(keywordLower)) {
        keywordsFound.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    });

    // Calculate keyword density
    const textContent = this.content.replace(/<[^>]*>/g, ' ');
    const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    let totalKeywordOccurrences = 0;
    keywordsFound.forEach(keyword => {
      const occurrences = (contentLower.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      totalKeywordOccurrences += occurrences;
    });
    
    const keywordDensity = wordCount > 0 ? (totalKeywordOccurrences / wordCount) * 100 : 0;

    return {
      keywordDensity,
      keywordsFound,
      missingKeywords
    };
  }

  private countInternalLinks(): number {
    const internalLinkRegex = /<a[^>]*href=["'](\/[^"']*)["'][^>]*>/gi;
    const matches = this.content.match(internalLinkRegex);
    return matches ? matches.length : 0;
  }

  private countExternalLinks(): number {
    const externalLinkRegex = /<a[^>]*href=["'](https?:\/\/[^"']*)["'][^>]*>/gi;
    const matches = this.content.match(externalLinkRegex);
    return matches ? matches.length : 0;
  }

  private countImages(): number {
    const imageRegex = /<img[^>]*>/gi;
    const matches = this.content.match(imageRegex);
    return matches ? matches.length : 0;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const wordCount = this.getContentLength();
    const headingAnalysis = this.analyzeHeadings();
    const keywordAnalysis = this.analyzeKeywords();
    const internalLinks = this.countInternalLinks();
    const externalLinks = this.countExternalLinks();
    const imageCount = this.countImages();

    // Content length recommendations
    if (wordCount < 300) {
      recommendations.push("Content is too short. Aim for at least 300 words.");
    } else if (wordCount < 1000) {
      recommendations.push("Consider expanding content to 1000+ words for better SEO.");
    }

    // Heading structure recommendations
    if (!headingAnalysis.hasH1) {
      recommendations.push("Add an H1 heading as the main title.");
    }
    if (!headingAnalysis.headingHierarchy) {
      recommendations.push("Improve heading hierarchy (H1 → H2 → H3, etc.).");
    }

    // Keyword recommendations
    if (keywordAnalysis.missingKeywords.length > 0) {
      recommendations.push(`Include these keywords: ${keywordAnalysis.missingKeywords.join(", ")}`);
    }
    if (keywordAnalysis.keywordDensity < 0.5) {
      recommendations.push("Increase keyword usage for better SEO.");
    } else if (keywordAnalysis.keywordDensity > 2.5) {
      recommendations.push("Reduce keyword usage to avoid over-optimization.");
    }

    // Link recommendations
    if (internalLinks < 3) {
      recommendations.push("Add more internal links to related content.");
    }
    if (externalLinks < 2) {
      recommendations.push("Include 2-3 authoritative external links.");
    }

    // Image recommendations
    if (imageCount === 0) {
      recommendations.push("Add relevant images to improve engagement.");
    }

    return recommendations;
  }
}