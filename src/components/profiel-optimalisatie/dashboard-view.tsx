"use client";

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Camera,
  FileText,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Zap,
  Calendar
} from 'lucide-react';

interface DashboardViewProps {
  profileData: any;
  onEdit: (step: string) => void;
}

export function DashboardView({ profileData, onEdit }: DashboardViewProps) {
  const overallScore = 92;
  const lastUpdated = new Date().toLocaleDateString('nl-NL');

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Profiel Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Je profiel is geoptimaliseerd en actief
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Live</span>
          </div>
        </div>

        {/* Score Overview */}
        <Card className="p-6 md:p-8 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Profiel Score</div>
                <div className="flex items-end gap-2">
                  <div className="text-5xl font-bold text-gray-900 dark:text-white">{overallScore}</div>
                  <div className="text-2xl text-gray-400 dark:text-gray-500 mb-1">/100</div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-1 rounded-full ${
                        i < 4 ? 'bg-gray-900 dark:bg-gray-100' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Laatst bijgewerkt: {lastUpdated}</span>
              </div>

              <Button
                onClick={() => onEdit('route')}
                variant="outline"
                className="border-2 border-gray-900 dark:border-gray-100 hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-gray-900"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Profiel Updaten
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Statistieken</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Profiel views</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">342</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Matches deze maand</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">18</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Response rate</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">67%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Insights */}
        <Card className="p-6 border-0 shadow-lg dark:bg-gray-800">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">AI Insights & Tips</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Laatste 14 dagen analyse</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">Je krijgt meer matches op dinsdag/donderdag</div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Upload nieuwe foto's op die dagen voor maximale impact
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Camera className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-purple-900 dark:text-purple-100 mb-1">Foto verversing aanbevolen</div>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Foto 3 is 6 maanden oud - tijd voor een refresh
                    </p>
                    <Button
                      onClick={() => onEdit('photos')}
                      size="sm"
                      variant="outline"
                      className="mt-2 border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 hover:bg-purple-600 dark:hover:bg-purple-600 hover:text-white"
                    >
                      Upload Nieuwe Foto
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card
            className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800"
            onClick={() => onEdit('photos')}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-gray-100 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white dark:text-gray-900" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Foto's</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Beheer je profielfoto's</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">6 foto's • Score 8.5/10</span>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800"
            onClick={() => onEdit('bio')}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-gray-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white dark:text-gray-900" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Bio</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Bewerk je profiel tekst</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Score 92/100</span>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-gray-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white dark:text-gray-900" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Gedetailleerde statistieken</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">+40% deze maand</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
