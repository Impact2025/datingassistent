import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';

interface ToolProgressData {
  toolName: string;
  completedActions: number;
  actionsCompleted: string[];
  progressPercentage: number;
  firstCompletion?: Date;
  lastCompletion?: Date;
}

interface ToolProgressIndicatorProps {
  toolId: string;
  toolName: string;
  totalActions?: number;
  showDetails?: boolean;
  className?: string;
}

export function ToolProgressIndicator({
  toolId,
  toolName,
  totalActions = 3,
  showDetails = false,
  className = ''
}: ToolProgressIndicatorProps) {
  const [progress, setProgress] = useState<ToolProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [toolId]);

  const loadProgress = async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/tool-completion/progress?toolName=${toolId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={`bg-white border-0 shadow-sm ${className}`}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Card className={`bg-white border-0 shadow-sm ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Nog niet gestart</p>
              <p className="text-xs text-gray-500">Begin met {toolName} om voortgang bij te houden</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isCompleted = progress.progressPercentage >= 100;
  const progressColor = isCompleted ? 'text-green-600' : 'text-blue-600';
  const progressBg = isCompleted ? 'bg-green-50' : 'bg-blue-50';
  const progressBorder = isCompleted ? 'border-green-200' : 'border-blue-200';

  return (
    <Card className={`bg-white border-0 shadow-sm ${progressBg} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isCompleted ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {isCompleted ? (
                <CheckCircle className={`w-4 h-4 ${progressColor}`} />
              ) : (
                <Target className={`w-4 h-4 ${progressColor}`} />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{toolName}</p>
              <p className="text-xs text-gray-600">
                {progress.completedActions} van {totalActions} stappen voltooid
              </p>
            </div>
          </div>

          <Badge
            variant={isCompleted ? "default" : "secondary"}
            className={isCompleted ? "bg-green-500" : ""}
          >
            {Math.round(progress.progressPercentage)}%
          </Badge>
        </div>

        <Progress
          value={progress.progressPercentage}
          className={`h-2 mb-2 ${isCompleted ? '[&>div]:bg-green-500' : '[&>div]:bg-blue-500'}`}
        />

        {showDetails && progress.actionsCompleted.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3 h-3 text-gray-400" />
              <span className="text-xs font-medium text-gray-700">Voltooide stappen:</span>
            </div>
            <div className="space-y-1">
              {progress.actionsCompleted.slice(0, 3).map((action, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-gray-600">{action.replace(/_/g, ' ')}</span>
                </div>
              ))}
              {progress.actionsCompleted.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{progress.actionsCompleted.length - 3} meer...
                </p>
              )}
            </div>
          </div>
        )}

        {progress.lastCompletion && (
          <div className="mt-2 text-xs text-gray-500">
            Laatste activiteit: {new Date(progress.lastCompletion).toLocaleDateString('nl-NL')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for easy progress tracking in components
export function useToolProgress(toolId: string) {
  const [progress, setProgress] = useState<ToolProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/tool-completion/progress?toolName=${toolId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async (actionName: string, metadata?: any) => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) return;

      const response = await fetch('/api/tool-completion/mark-completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          toolName: toolId,
          actionName,
          metadata
        }),
      });

      if (response.ok) {
        // Reload progress after marking complete
        await loadProgress();
      }
    } catch (error) {
      console.error('Error marking completion:', error);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [toolId]);

  return { progress, loading, loadProgress, markCompleted };
}