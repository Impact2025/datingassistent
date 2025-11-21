"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Link,
  Globe,
  Search,
  BarChartIcon
} from "lucide-react";
import { useState } from "react";

interface SEOChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export function SEOChecklist() {
  const [checklistItems, setChecklistItems] = useState<SEOChecklistItem[]>([
    // Technical SEO
    {
      id: "tech-1",
      category: "Technical SEO",
      title: "XML Sitemap",
      description: "Create and submit XML sitemap to search engines",
      completed: true,
      priority: "high"
    },
    {
      id: "tech-2",
      category: "Technical SEO",
      title: "Robots.txt",
      description: "Configure robots.txt file for proper crawling",
      completed: true,
      priority: "high"
    },
    {
      id: "tech-3",
      category: "Technical SEO",
      title: "HTTPS",
      description: "Ensure all pages are served over HTTPS",
      completed: true,
      priority: "high"
    },
    {
      id: "tech-4",
      category: "Technical SEO",
      title: "Mobile Friendly",
      description: "Test and optimize for mobile devices",
      completed: false,
      priority: "high"
    },
    {
      id: "tech-5",
      category: "Technical SEO",
      title: "Page Speed",
      description: "Optimize loading times for better UX and SEO",
      completed: false,
      priority: "high"
    },
    
    // On-Page SEO
    {
      id: "onpage-1",
      category: "On-Page SEO",
      title: "Title Tags",
      description: "Write unique, descriptive title tags for each page",
      completed: false,
      priority: "high"
    },
    {
      id: "onpage-2",
      category: "On-Page SEO",
      title: "Meta Descriptions",
      description: "Create compelling meta descriptions for each page",
      completed: false,
      priority: "high"
    },
    {
      id: "onpage-3",
      category: "On-Page SEO",
      title: "Header Tags",
      description: "Use proper H1, H2, H3 heading structure",
      completed: false,
      priority: "medium"
    },
    {
      id: "onpage-4",
      category: "On-Page SEO",
      title: "Internal Links",
      description: "Add relevant internal links between pages",
      completed: false,
      priority: "medium"
    },
    {
      id: "onpage-5",
      category: "On-Page SEO",
      title: "Alt Text",
      description: "Add descriptive alt text to all images",
      completed: false,
      priority: "medium"
    },
    
    // Content SEO
    {
      id: "content-1",
      category: "Content SEO",
      title: "Keyword Research",
      description: "Identify and target relevant keywords",
      completed: false,
      priority: "high"
    },
    {
      id: "content-2",
      category: "Content SEO",
      title: "Content Length",
      description: "Ensure blog posts are 1000+ words for better SEO",
      completed: false,
      priority: "medium"
    },
    {
      id: "content-3",
      category: "Content SEO",
      title: "Content Freshness",
      description: "Regularly update and refresh existing content",
      completed: false,
      priority: "low"
    },
    {
      id: "content-4",
      category: "Content SEO",
      title: "Content Quality",
      description: "Create original, valuable content for users",
      completed: false,
      priority: "high"
    },
    
    // Off-Page SEO
    {
      id: "offpage-1",
      category: "Off-Page SEO",
      title: "Backlinks",
      description: "Build high-quality backlinks from authoritative sites",
      completed: false,
      priority: "high"
    },
    {
      id: "offpage-2",
      category: "Off-Page SEO",
      title: "Social Media",
      description: "Promote content on social media platforms",
      completed: false,
      priority: "medium"
    },
    {
      id: "offpage-3",
      category: "Off-Page SEO",
      title: "Local Listings",
      description: "Claim and optimize local business listings",
      completed: false,
      priority: "medium"
    }
  ]);

  const toggleItem = (id: string) => {
    setChecklistItems(items => 
      items.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const markAllCompleted = () => {
    setChecklistItems(items => 
      items.map(item => ({ ...item, completed: true }))
    );
  };

  const resetChecklist = () => {
    setChecklistItems(items => 
      items.map(item => ({ ...item, completed: false }))
    );
  };

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technical SEO': return <Globe className="h-4 w-4" />;
      case 'On-Page SEO': return <FileText className="h-4 w-4" />;
      case 'Content SEO': return <Search className="h-4 w-4" />;
      case 'Off-Page SEO': return <BarChartIcon className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>SEO Implementation Checklist</CardTitle>
            <CardDescription>
              Track your SEO progress and ensure nothing is missed
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{completedCount}/{totalCount}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllCompleted}
            disabled={completedCount === totalCount}
          >
            Mark All Complete
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetChecklist}
            disabled={completedCount === 0}
          >
            Reset All
          </Button>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                item.completed ? 'bg-muted/50' : 'bg-background'
              }`}
            >
              <Checkbox
                id={item.id}
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${getPriorityColor(item.priority)}`}>
                    {getCategoryIcon(item.category)}
                    {item.category}
                  </span>
                  <span className={`text-sm font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {item.title}
                  </span>
                </div>
                <p className={`text-sm ${item.completed ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>
                  {item.description}
                </p>
              </div>
              <div className="flex items-center">
                {item.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span>{Math.round((completedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}