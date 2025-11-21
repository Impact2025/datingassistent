"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  BarChartIcon, 
  Globe, 
  Link, 
  FileText, 
  TrendingUp,
  Clock,
  Eye
} from "lucide-react";
import { useEffect, useState } from "react";
import { SEOChecklist } from "./seo-checklist";

interface SEOMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'good' | 'warning' | 'bad';
}

export function SEODashboard() {
  const [metrics, setMetrics] = useState<SEOMetric[]>([
    { name: 'Indexed Pages', value: 0, target: 100, unit: 'pages', status: 'warning' },
    { name: 'Avg. Position', value: 0, target: 10, unit: 'position', status: 'warning' },
    { name: 'Organic Traffic', value: 0, target: 1000, unit: 'visitors', status: 'warning' },
    { name: 'Content Score', value: 0, target: 80, unit: 'points', status: 'warning' },
    { name: 'Backlinks', value: 0, target: 50, unit: 'links', status: 'warning' },
    { name: 'Core Web Vitals', value: 0, target: 90, unit: 'score', status: 'warning' },
  ]);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setMetrics([
        { name: 'Indexed Pages', value: 42, target: 100, unit: 'pages', status: 'warning' },
        { name: 'Avg. Position', value: 15, target: 10, unit: 'position', status: 'bad' },
        { name: 'Organic Traffic', value: 245, target: 1000, unit: 'visitors', status: 'bad' },
        { name: 'Content Score', value: 68, target: 80, unit: 'points', status: 'warning' },
        { name: 'Backlinks', value: 12, target: 50, unit: 'links', status: 'bad' },
        { name: 'Core Web Vitals', value: 72, target: 90, unit: 'score', status: 'warning' },
      ]);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'bad': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressValue = (value: number, target: number) => {
    return Math.min((value / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SEO Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your website's search engine optimization performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indexed Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              of 100 pages indexed
            </p>
            <Progress value={42} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organic Traffic</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">
              visitors this month
            </p>
            <Progress value={24.5} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Position</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              target: top 10
            </p>
            <Progress value={66} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SEO Metrics Overview</CardTitle>
            <CardDescription>
              Current performance against targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(metric.status)}`}></div>
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {metric.value} {metric.unit}
                    </span>
                  </div>
                  <Progress 
                    value={getProgressValue(metric.value, metric.target)} 
                    className="h-2" 
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>Target: {metric.target} {metric.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Improve your SEO performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Submit Sitemap</p>
                    <p className="text-sm text-muted-foreground">
                      Submit to Google Search Console
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Link className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Fix Broken Links</p>
                    <p className="text-sm text-muted-foreground">
                      3 broken links found
                    </p>
                  </div>
                </div>
                <Badge variant="destructive">3</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Add Meta Descriptions</p>
                    <p className="text-sm text-muted-foreground">
                      5 pages missing descriptions
                    </p>
                  </div>
                </div>
                <Badge variant="destructive">5</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Improve Page Speed</p>
                    <p className="text-sm text-muted-foreground">
                      Core Web Vitals score: 72
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Needs Work</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Add Alt Text</p>
                    <p className="text-sm text-muted-foreground">
                      8 images missing alt text
                    </p>
                  </div>
                </div>
                <Badge variant="destructive">8</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Checklist */}
      <SEOChecklist />
    </div>
  );
}