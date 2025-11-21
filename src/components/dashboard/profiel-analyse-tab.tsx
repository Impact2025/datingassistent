"use client";

import { ProfileAnalysis } from '@/components/profile-analysis';

export function ProfielAnalyseTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">🎯 Profiel Analyse</h2>
        <p className="text-muted-foreground">
          Laat je complete profiel analyseren door onze AI voor een professionele beoordeling.
        </p>

        {/* Workflow Guide */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Aanbevolen workflow:</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">1</span>
              <span><strong>Profiel coach</strong> → Creëer eerst sterke profieltekst</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span><strong>Foto advies</strong> → Optimaliseer je profielfoto's</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">3</span>
              <span><strong>Profiel analyse</strong> → Krijg overall beoordeling van je complete profiel</span>
            </div>
          </div>
        </div>
      </div>

      <ProfileAnalysis />
    </div>
  );
}