'use client';

/**
 * Het Pad - 5 Fase Gestructureerde Journey
 * Fase 1: Fundament
 * Fase 2: Profiel
 * Fase 3: Communicatie
 * Fase 4: Actief Daten
 * Fase 5: Verdieping
 */

import { motion } from 'framer-motion';
import { User, Camera, MessageCircle, Heart, GraduationCap, ChevronRight, CheckCircle2, Circle, Lock } from 'lucide-react';

interface PadTabProps {
  onTabChange?: (tab: string) => void;
}

const JOURNEY_PHASES = [
  {
    id: 'fundament',
    title: 'Fase 1: Fundament',
    description: 'Bouw een sterke basis: zelfbeeld, hechtingsstijl, waarden',
    icon: User,
    color: 'pink',
    tools: [
      { name: 'Zelfbeeld Assessment', action: 'profile-suite' },
      { name: 'Hechtingsstijl Scan', action: 'profile-suite' },
      { name: 'Waarden Kompas', action: 'groei-doelen' },
      { name: 'Dating Stijl Scan', action: 'datingstijl' }
    ],
    progress: 75,
    status: 'in_progress'
  },
  {
    id: 'profiel',
    title: 'Fase 2: Profiel',
    description: 'Creëer een aantrekkelijk dating profiel',
    icon: Camera,
    color: 'purple',
    tools: [
      { name: 'Foto Advies', action: 'foto-advies' },
      { name: 'Bio Generator', action: 'profile-suite' },
      { name: 'Platform Match', action: 'profile-suite' }
    ],
    progress: 30,
    status: 'in_progress'
  },
  {
    id: 'communicatie',
    title: 'Fase 3: Communicatie',
    description: 'Leer effectief communiceren en gesprekken voeren',
    icon: MessageCircle,
    color: 'blue',
    tools: [
      { name: 'Openingszinnen', action: 'chat-coach' },
      { name: 'Gesprek Coach', action: 'chat-coach' },
      { name: 'IJsbrekers', action: 'communicatie-matching' }
    ],
    progress: 0,
    status: 'locked'
  },
  {
    id: 'actief-daten',
    title: 'Fase 4: Actief Daten',
    description: 'Plan dates, blijf veilig, bouw verbinding',
    icon: Heart,
    color: 'red',
    tools: [
      { name: 'Date Planner', action: 'dateplanner' },
      { name: 'Veiligheidscheck', action: 'dateplanner' },
      { name: 'Relatiepatronen', action: 'groei-doelen' }
    ],
    progress: 0,
    status: 'locked'
  },
  {
    id: 'verdieping',
    title: 'Fase 5: Verdieping',
    description: 'Ontwikkel diepere relatie skills',
    icon: GraduationCap,
    color: 'green',
    tools: [
      { name: 'Cursussen', href: '/cursussen' },
      { name: 'Emotionele Readiness', action: 'profile-suite' },
      { name: 'Dating Stijl Scan', action: 'datingstijl' }
    ],
    progress: 0,
    status: 'locked'
  }
];

export function PadTab({ onTabChange }: PadTabProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Jouw Dating Reis
          </h1>
          <p className="text-gray-600">
            Volg de 5 fases en ontwikkel jezelf stap voor stap tot een betere dater
          </p>
        </motion.div>

        {/* Journey Path */}
        <div className="space-y-6">
          {JOURNEY_PHASES.map((phase, index) => {
            const Icon = phase.icon;
            const isLocked = phase.status === 'locked';
            const isCompleted = phase.status === 'completed';
            const isActive = phase.status === 'in_progress';

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all ${
                  isActive
                    ? 'border-coral-300 shadow-md'
                    : isCompleted
                    ? 'border-green-300'
                    : 'border-gray-200'
                } ${isLocked ? 'opacity-60' : 'hover:shadow-md cursor-pointer'}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isActive
                      ? 'bg-coral-100'
                      : isCompleted
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                  }`}>
                    {isLocked ? (
                      <Lock className="w-6 h-6 text-gray-400" />
                    ) : (
                      <Icon className={`w-6 h-6 ${
                        isActive
                          ? 'text-coral-500'
                          : isCompleted
                          ? 'text-green-500'
                          : 'text-gray-400'
                      }`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {phase.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {phase.description}
                        </p>
                      </div>

                      {/* Status Badge */}
                      {isCompleted && (
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Progress Bar */}
                    {!isLocked && phase.progress > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Voortgang</span>
                          <span>{phase.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-coral-500 h-2 rounded-full transition-all"
                            style={{ width: `${phase.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Tools */}
                    {!isLocked && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {phase.tools.map((tool) => {
                          const isAction = 'action' in tool;
                          const Component = isAction ? 'button' : 'a';
                          const props = isAction
                            ? { onClick: () => onTabChange?.(tool.action) }
                            : { href: tool.href };

                          return (
                            <Component
                              key={tool.name}
                              {...props}
                              className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-coral-50
                                       rounded-lg text-sm text-gray-700 hover:text-coral-600
                                       transition-all group"
                            >
                              <Circle className="w-3 h-3 text-gray-400 group-hover:text-coral-500" />
                              <span>{tool.name}</span>
                              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Component>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500">
            Niet zeker waar te beginnen?{' '}
            <a href="/coach" className="text-coral-600 hover:text-coral-700 font-medium">
              Vraag Iris om hulp
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
