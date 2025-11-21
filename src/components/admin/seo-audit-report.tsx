"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Link, 
  Image, 
  Clock,
  Download
} from "lucide-react";
import { useState } from "react";

interface SEOAuditItem {
  id: string;
  category: string;
  title: string;
  description: string;
  status: 'passed' | 'failed' | 'warning';
  priority: 'high' | 'medium' | 'low';
  recommendation?: string;
}

export function SEOAuditReport() {
  const [auditItems] = useState<SEOAuditItem[]>([
    {
      id: "1",
      category: "Technical SEO",
      title: "Mobile Friendly",
      description: "Website is responsive on mobile devices",
      status: "passed",
      priority: "high"
    },
    {
      id: "2",
      category: "Technical SEO",
      title: "HTTPS Security",
      description: "Website uses secure HTTPS protocol",
      status: "passed",
      priority: "high"
    },
    {
      id: "3",
      category: "Content SEO",
      title: "Title Tags",
      description: "75% of pages have optimized title tags",
      status: "warning",
      priority: "high",
      recommendation: "Add title tags to remaining pages"
    },
    {
      id: "4",
      category: "Content SEO",
      title: "Meta Descriptions",
      description: "Only 60% of pages have meta descriptions",
      status: "failed",
      priority: "high",
      recommendation: "Add meta descriptions to all pages"
    },
    {
      id: "5",
      category: "Content SEO",
      title: "Content Length",
      description: "Average content length is 850 words",
      status: "warning",
      priority: "medium",
      recommendation: "Expand content to 1000+ words for better SEO"
    },
    {
      id: "6",
      category: "Technical SEO",
      title: "Page Speed",
      description: "Mobile score: 65/100, Desktop score: 78/100",
      status: "failed",
      priority: "high",
      recommendation: "Optimize images and reduce JavaScript bundles"
    },
    {
      id: "7",
      category: "Technical SEO",
      title: "Broken Links",
      description: "3 broken internal links found",
      status: "failed",
      priority: "high",
      recommendation: "Fix or remove broken links"
    },
    {
      id: "8",
      category: "Content SEO",
      title: "Alt Text",
      description: "8 images missing alt text",
      status: "failed",
      priority: "medium",
      recommendation: "Add descriptive alt text to all images"
    },
    {
      id: "9",
      category: "Technical SEO",
      title: "Sitemap",
      description: "Sitemap is properly configured and submitted",
      status: "passed",
      priority: "medium"
    },
    {
      id: "10",
      category: "Content SEO",
      title: "Internal Linking",
      description: "Average of 2.3 internal links per page",
      status: "warning",
      priority: "low",
      recommendation: "Increase internal links to improve site structure"
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const passedItems = auditItems.filter(item => item.status === 'passed').length;
  const failedItems = auditItems.filter(item => item.status === 'failed').length;
  const warningItems = auditItems.filter(item => item.status === 'warning').length;

  const exportReport = () => {
    const reportData = {
      generated: new Date().toISOString(),
      summary: {
        total: auditItems.length,
        passed: passedItems,
        failed: failedItems,
        warnings: warningItems
      },
      items: auditItems
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-audit-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SEO Audit Report</h1>
          <p className="text-muted-foreground">
            Generated on {new Date().toLocaleDateString('nl-NL')}
          </p>
        </div>
        <Button onClick={exportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{auditItems.length}</div>
            <div className="text-sm text-muted-foreground">Total Checks</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold">{passedItems}</div>
            <div className="text-sm text-muted-foreground">Passed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
            <div className="text-2xl font-bold">{failedItems}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">{warningItems}</div>
            <div className="text-sm text-muted-foreground">Warnings</div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Items */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Audit Results</CardTitle>
          <CardDescription>
            Review each SEO check and take action where needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditItems.map((item) => (
              <div 
                key={item.id} 
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <Badge variant="secondary">{item.category}</Badge>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.description}
                      </p>
                      {item.recommendation && (
                        <div className="flex items-start gap-2 mt-2">
                          <span className="text-sm font-medium">Recommendation:</span>
                          <p className="text-sm">{item.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Action Plan</CardTitle>
          <CardDescription>
            Prioritized tasks to improve your SEO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                High Priority (Fix Immediately)
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Add meta descriptions to all pages</li>
                <li>Fix broken internal links</li>
                <li>Optimize page speed for mobile devices</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Medium Priority (Address Soon)
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Expand content to 1000+ words</li>
                <li>Add alt text to all images</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Low Priority (Nice to Have)
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Increase internal linking between pages</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}