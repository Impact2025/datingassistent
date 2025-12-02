'use client';

/**
 * Home Tab - Smart Dashboard met personalisatie
 */

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Target, Calendar, GraduationCap, BarChart3 } from 'lucide-react';
import { PersonalizedWelcome } from './personalized-welcome';
import { MijnCursussenWidget } from './mijn-cursussen-widget';
import { MyProgramsWidget } from './my-programs-widget';
import { RecommendedContent } from '../recommendations/recommended-content';
import { Button } from '../ui/button';

interface HomeTabProps {
  onTabChange?: (tab: string) => void;
  userId?: number;
}

export function HomeTab({ onTabChange, userId }: HomeTabProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welkom Sectie */}
        <PersonalizedWelcome />

        {/* Snelle Acties */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Coach */}
          <a
            href="/coach"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200
                     hover:shadow-md hover:border-pink-300 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm
                            group-hover:shadow-md transition-all">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Praat met Iris</h3>
            </div>
            <p className="text-sm text-gray-600">
              Krijg direct advies van je AI dating coach
            </p>
          </a>

          {/* Cursussen */}
          <a
            href="/cursussen"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200
                     hover:shadow-md hover:border-pink-300 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm
                            group-hover:shadow-md transition-all">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Cursussen</h3>
            </div>
            <p className="text-sm text-gray-600">
              Leer nieuwe dating vaardigheden
            </p>
          </a>

          {/* Pad */}
          <button
            onClick={() => onTabChange?.('pad')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200
                     hover:shadow-md hover:border-pink-300 transition-all group text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm
                            group-hover:shadow-md transition-all">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Mijn Reis</h3>
            </div>
            <p className="text-sm text-gray-600">
              Bekijk je voortgang door de 5 fases
            </p>
          </button>

          {/* Doelen */}
          <button
            onClick={() => onTabChange?.('profiel')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200
                     hover:shadow-md hover:border-pink-300 transition-all group text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm
                            group-hover:shadow-md transition-all">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Mijn Doelen</h3>
            </div>
            <p className="text-sm text-gray-600">
              Stel je dating doelen en track ze
            </p>
          </button>

          {/* Analytics - NEW! */}
          <a
            href="/analytics"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200
                     hover:shadow-md hover:border-pink-300 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm
                            group-hover:shadow-md transition-all">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Analytics</h3>
            </div>
            <p className="text-sm text-gray-600">
              Bekijk je leerstatistieken en voortgang
            </p>
          </a>
        </motion.div>

        {/* Mijn Cursussen Widget */}
        <MijnCursussenWidget />

        {/* Mijn Programma's Widget - NIEUW Sprint 4! */}
        <MyProgramsWidget />

        {/* AI-Powered Recommendations - NIEUW Sprint 5.2! */}
        <RecommendedContent limit={6} showInsights={true} />

        {/* Vandaag Focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-semibold text-gray-900">Vandaag</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Verbeter je profiel</p>
                <p className="text-xs text-gray-600">Upload een nieuwe foto en laat Iris feedback geven</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Oefen je openingszinnen</p>
                <p className="text-xs text-gray-600">Genereer 3 nieuwe openers en kies je favoriet</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Reflecteer op je week</p>
                <p className="text-xs text-gray-600">Wat ging goed? Wat kan beter?</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recente Activiteit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Actief</h2>

          <div className="space-y-3 text-sm text-gray-600">
            <p>Je hebt nog geen activiteit. Begin met een van de snelle acties hierboven!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
