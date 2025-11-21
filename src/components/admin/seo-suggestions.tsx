"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  analyzeContentLength, 
  suggestInternalLinks, 
  analyzeKeywords,
  analyzeHeadings
} from "@/lib/seo-utils";
import { useEffect, useState } from "react";

interface SEOSuggestionsProps {
  title: string;
  content: string;
  keywords: string[];
  slug: string;
  allSlugs: string[];
}

export function SEOSuggestions({ 
  title, 
  content, 
  keywords, 
  slug, 
  allSlugs 
}: SEOSuggestionsProps) {
  const [suggestions, setSuggestions] = useState({
    contentLength: { wordCount: 0, readingTime: 0, recommendations: [] as string[] },
    internalLinks: [] as string[],
    keywordAnalysis: { 
      titleKeywords: [] as string[], 
      contentKeywords: [] as string[], 
      missingKeywords: [] as string[], 
      recommendations: [] as string[] 
    },
    headingAnalysis: { 
      headingStructure: [] as { level: number; text: string }[], 
      recommendations: [] as string[] 
    }
  });

  useEffect(() => {
    // Analyze content
    const contentLength = analyzeContentLength(content);
    const internalLinks = suggestInternalLinks(content, slug, allSlugs);
    const keywordAnalysis = analyzeKeywords(title, content, keywords);
    const headingAnalysis = analyzeHeadings(content);
    
    setSuggestions({
      contentLength,
      internalLinks,
      keywordAnalysis,
      headingAnalysis
    });
  }, [title, content, keywords, slug, allSlugs]);

  return (
    <div className="grid gap-6">
      {/* Content Length Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Content Length Analysis</CardTitle>
          <CardDescription>
            Word count and reading time metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Word Count</p>
              <p className="text-2xl font-bold">{suggestions.contentLength.wordCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reading Time</p>
              <p className="text-2xl font-bold">{suggestions.contentLength.readingTime} min</p>
            </div>
          </div>
          
          {suggestions.contentLength.recommendations.map((rec, index) => (
            <Badge key={index} variant="secondary" className="mb-2">
              {rec}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* Keyword Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Analysis</CardTitle>
          <CardDescription>
            How well your keywords are integrated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Keywords in Title</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.keywordAnalysis.titleKeywords.length > 0 ? (
                  suggestions.keywordAnalysis.titleKeywords.map((keyword, index) => (
                    <Badge key={index} variant="default">{keyword}</Badge>
                  ))
                ) : (
                  <Badge variant="destructive">None found</Badge>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Keywords in Content</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.keywordAnalysis.contentKeywords.length > 0 ? (
                  suggestions.keywordAnalysis.contentKeywords.map((keyword, index) => (
                    <Badge key={index} variant="default">{keyword}</Badge>
                  ))
                ) : (
                  <Badge variant="destructive">None found</Badge>
                )}
              </div>
            </div>
            
            {suggestions.keywordAnalysis.missingKeywords.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Missing Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.keywordAnalysis.missingKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline">{keyword}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {suggestions.keywordAnalysis.recommendations.map((rec, index) => (
              <Badge key={index} variant="secondary" className="mb-2">
                {rec}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Heading Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Heading Structure</CardTitle>
          <CardDescription>
            Your content's heading hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.headingAnalysis.headingStructure.length > 0 ? (
            <div className="space-y-2">
              {suggestions.headingAnalysis.headingStructure.map((heading, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="outline">H{heading.level}</Badge>
                  <span className="text-sm">{heading.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No headings found</p>
          )}
          
          {suggestions.headingAnalysis.recommendations.map((rec, index) => (
            <Badge key={index} variant="secondary" className="mt-2">
              {rec}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* Internal Linking Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Internal Linking Suggestions</CardTitle>
          <CardDescription>
            Opportunities to link to other content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.internalLinks.length > 0 ? (
            <div className="space-y-3">
              {suggestions.internalLinks.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-sm">•</span>
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
              <Button size="sm" className="mt-2">
                Add Internal Links
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No specific internal linking opportunities identified. 
              Consider linking to related blog posts manually.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}