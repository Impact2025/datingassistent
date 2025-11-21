"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  BookOpen, 
  Hash,
  Link,
  Image as ImageIcon
} from "lucide-react";
import { ContentQualityAnalyzer } from "@/lib/content-quality-analyzer";

interface ContentQualityPanelProps {
  title: string;
  content: string;
  keywords: string[];
}

export function ContentQualityPanel({ title, content, keywords }: ContentQualityPanelProps) {
  const analyzer = new ContentQualityAnalyzer(content, title, keywords);
  const report = analyzer.analyze();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Quality Analysis</CardTitle>
        <CardDescription>
          Review your content's SEO and readability performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Readability</span>
              <Badge variant={getScoreVariant(report.readabilityScore)}>
                {Math.round(report.readabilityScore)}%
              </Badge>
            </div>
            <Progress value={report.readabilityScore} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">SEO Quality</span>
              <Badge variant={getScoreVariant(report.seoScore)}>
                {Math.round(report.seoScore)}%
              </Badge>
            </div>
            <Progress value={report.seoScore} className="h-2" />
          </div>
        </div>

        {/* Content Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <BookOpen className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{report.contentLength}</div>
            <div className="text-xs text-muted-foreground">Words</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <Hash className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{report.headingStructure.headingCount}</div>
            <div className="text-xs text-muted-foreground">Headings</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <Link className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">
              {report.internalLinks + report.externalLinks}
            </div>
            <div className="text-xs text-muted-foreground">Links</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <ImageIcon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{report.imageCount}</div>
            <div className="text-xs text-muted-foreground">Images</div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="space-y-4">
          <h3 className="font-medium">Analysis Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded bg-muted/50">
              <span className="text-sm">Content Length</span>
              <div className="flex items-center">
                {report.contentLength >= 1000 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : report.contentLength >= 300 ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2 rounded bg-muted/50">
              <span className="text-sm">H1 Heading</span>
              <div className="flex items-center">
                {report.headingStructure.hasH1 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2 rounded bg-muted/50">
              <span className="text-sm">Heading Hierarchy</span>
              <div className="flex items-center">
                {report.headingStructure.headingHierarchy ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2 rounded bg-muted/50">
              <span className="text-sm">Keywords Used</span>
              <div className="flex items-center">
                {report.keywordAnalysis.keywordsFound.length > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2 rounded bg-muted/50">
              <span className="text-sm">Internal Links</span>
              <div className="flex items-center">
                {report.internalLinks >= 3 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {report.recommendations.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Recommendations</h3>
            <ul className="space-y-1">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}