"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Clock, 
  Image as ImageIcon, 
  Server,
  Wifi,
  AlertTriangle
} from "lucide-react";
import { useEffect, useState } from "react";

interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint (ms)
  ttfb: number; // Time to First Byte (ms)
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading performance data
    const timer = setTimeout(() => {
      setMetrics({
        lcp: 2847,
        fid: 12,
        cls: 0.05,
        fcp: 1234,
        ttfb: 87
      });
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getMetricStatus = (value: number, thresholds: [number, number]): 'good' | 'needs-improvement' | 'poor' => {
    if (value <= thresholds[0]) return 'good';
    if (value <= thresholds[1]) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'needs-improvement': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <Zap className="h-4 w-4 text-green-500" />;
      case 'needs-improvement': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'poor': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Monitor</CardTitle>
          <CardDescription>
            Loading Core Web Vitals data...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/3"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-8"></div>
                </div>
                <div className="h-2 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Core Web Vitals thresholds
  const lcpStatus = getMetricStatus(metrics.lcp, [2500, 4000]); // ms
  const fidStatus = getMetricStatus(metrics.fid, [100, 300]); // ms
  const clsStatus = getMetricStatus(metrics.cls, [0.1, 0.25]); // unitless

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Performance Monitor
        </CardTitle>
        <CardDescription>
          Core Web Vitals and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Web Vitals Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="flex justify-center mb-2">
              {getStatusIcon(lcpStatus)}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(lcpStatus)}`}>
              {(metrics.lcp / 1000).toFixed(2)}s
            </div>
            <div className="text-xs text-muted-foreground">LCP</div>
            <Badge 
              variant={lcpStatus === 'good' ? 'default' : lcpStatus === 'needs-improvement' ? 'secondary' : 'destructive'}
              className="mt-1"
            >
              {lcpStatus.replace('-', ' ')}
            </Badge>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="flex justify-center mb-2">
              {getStatusIcon(fidStatus)}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(fidStatus)}`}>
              {metrics.fid}ms
            </div>
            <div className="text-xs text-muted-foreground">FID</div>
            <Badge 
              variant={fidStatus === 'good' ? 'default' : fidStatus === 'needs-improvement' ? 'secondary' : 'destructive'}
              className="mt-1"
            >
              {fidStatus.replace('-', ' ')}
            </Badge>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="flex justify-center mb-2">
              {getStatusIcon(clsStatus)}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(clsStatus)}`}>
              {metrics.cls.toFixed(3)}
            </div>
            <div className="text-xs text-muted-foreground">CLS</div>
            <Badge 
              variant={clsStatus === 'good' ? 'default' : clsStatus === 'needs-improvement' ? 'secondary' : 'destructive'}
              className="mt-1"
            >
              {clsStatus.replace('-', ' ')}
            </Badge>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-4">
          <h3 className="font-medium">Detailed Metrics</h3>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  First Contentful Paint (FCP)
                </span>
                <span className="font-medium">{(metrics.fcp / 1000).toFixed(2)}s</span>
              </div>
              <Progress value={Math.min((metrics.fcp / 3000) * 100, 100)} className="h-2" />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  Time to First Byte (TTFB)
                </span>
                <span className="font-medium">{metrics.ttfb}ms</span>
              </div>
              <Progress value={Math.min((metrics.ttfb / 200) * 100, 100)} className="h-2" />
            </div>
          </div>
        </div>

        {/* Optimization Recommendations */}
        <div className="space-y-3">
          <h3 className="font-medium">Optimization Recommendations</h3>
          
          <div className="space-y-2">
            {lcpStatus !== 'good' && (
              <div className="flex items-start gap-2 p-2 rounded bg-muted/50">
                <ImageIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium">Largest Contentful Paint:</span> Optimize largest images and fonts
                </div>
              </div>
            )}
            
            {fidStatus !== 'good' && (
              <div className="flex items-start gap-2 p-2 rounded bg-muted/50">
                <Wifi className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium">First Input Delay:</span> Reduce JavaScript execution time
                </div>
              </div>
            )}
            
            {clsStatus !== 'good' && (
              <div className="flex items-start gap-2 p-2 rounded bg-muted/50">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium">Cumulative Layout Shift:</span> Reserve space for images and ads
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}