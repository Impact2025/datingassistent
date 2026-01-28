'use client';

/**
 * Dating Snapshot - Question Components
 *
 * World-class question components for the onboarding experience.
 * Features:
 * - Mobile-first responsive design
 * - Full keyboard accessibility (arrow keys, tab, enter)
 * - ARIA labels and roles for screen readers
 * - Beautiful Framer Motion animations
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Check, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  Question,
  ScaleQuestion as ScaleQ,
  SliderQuestion as SliderQ,
  RankingQuestion as RankingQ,
  MultiSelectQuestion as MultiSelectQ,
  SelectQuestion as SelectQ,
  TextQuestion as TextQ,
  BooleanQuestion as BooleanQ,
  SelectOption,
} from '@/types/dating-snapshot.types';

// =====================================================
// SCALE QUESTION (1-5 with labels)
// =====================================================

interface ScaleQuestionProps {
  question: ScaleQ;
  value: number | null;
  onChange: (value: number) => void;
  error?: string;
}

export function ScaleQuestion({ question, value, onChange, error }: ScaleQuestionProps) {
  const options = Array.from(
    { length: question.max - question.min + 1 },
    (_, i) => question.min + i
  );

  return (
    <div className="space-y-4">
      <label
        id={`${question.id}-label`}
        className="block text-base font-medium text-gray-900"
      >
        {question.label}
        {question.required && <span className="text-coral-500 ml-1" aria-hidden="true">*</span>}
        {question.required && <span className="sr-only">(verplicht)</span>}
      </label>

      {question.helper_text && (
        <p id={`${question.id}-helper`} className="text-sm text-gray-500">
          {question.helper_text}
        </p>
      )}

      <div
        role="radiogroup"
        aria-labelledby={`${question.id}-label`}
        aria-describedby={question.helper_text ? `${question.id}-helper` : undefined}
        className="flex justify-between gap-1 sm:gap-2"
      >
        {options.map((num) => (
          <motion.button
            key={num}
            type="button"
            role="radio"
            aria-checked={value === num}
            aria-label={`${num}${question.labels?.[num] ? `: ${question.labels[num]}` : ''}`}
            onClick={() => onChange(num)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              // Base styles with minimum touch target (44px)
              'flex-1 py-3 sm:py-4 px-1 sm:px-2 rounded-lg sm:rounded-xl border-2',
              'text-center transition-all min-h-[56px] sm:min-h-[60px] min-w-[44px]',
              'flex flex-col items-center justify-center touch-manipulation',
              'focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2',
              value === num
                ? 'border-coral-500 bg-coral-50 text-coral-700'
                : 'border-gray-200 hover:border-coral-200 hover:bg-coral-50/50'
            )}
          >
            <span className="text-base sm:text-lg font-semibold">{num}</span>
            {/* Show labels only on larger screens to prevent cramping */}
            {question.labels?.[num] && (
              <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 line-clamp-2 hidden sm:block">
                {question.labels[num]}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Min/Max labels - always visible on mobile */}
      <div className="flex justify-between text-xs text-gray-400 px-1">
        <span className="max-w-[45%] text-left">{question.labels?.[question.min]}</span>
        <span className="max-w-[45%] text-right">{question.labels?.[question.max]}</span>
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// =====================================================
// SLIDER QUESTION (Continuous value)
// =====================================================

interface SliderQuestionProps {
  question: SliderQ;
  value: number | null;
  onChange: (value: number) => void;
  error?: string;
}

export function SliderQuestion({ question, value, onChange, error }: SliderQuestionProps) {
  const [localValue, setLocalValue] = useState(value ?? question.default ?? question.min);
  const sliderRef = useRef<HTMLInputElement>(null);
  const sliderId = `slider-${question.id}`;

  useEffect(() => {
    if (value !== null && value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = (newValue: number) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const percentage = ((localValue - question.min) / (question.max - question.min)) * 100;

  return (
    <div className="space-y-4">
      <label
        id={`${sliderId}-label`}
        htmlFor={sliderId}
        className="block text-base font-medium text-gray-900"
      >
        {question.label}
        {question.required && <span className="text-coral-500 ml-1" aria-hidden="true">*</span>}
        {question.required && <span className="sr-only">(verplicht)</span>}
      </label>

      {question.helper_text && (
        <p id={`${sliderId}-helper`} className="text-sm text-gray-500">
          {question.helper_text}
        </p>
      )}

      {/* Value display */}
      <div className="text-center" aria-live="polite" aria-atomic="true">
        <span className="text-3xl sm:text-4xl font-bold text-coral-600">
          {localValue}
          {question.unit && <span className="text-xl sm:text-2xl ml-1">{question.unit}</span>}
        </span>
      </div>

      {/* Slider - increased touch target */}
      <div className="relative pt-4 pb-8 px-2">
        {/* Track background */}
        <div className="relative h-3 sm:h-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-coral-400 to-coral-500 rounded-full"
            style={{ width: `${percentage}%` }}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Native input with increased height for touch */}
        <input
          ref={sliderRef}
          id={sliderId}
          type="range"
          min={question.min}
          max={question.max}
          step={question.step}
          value={localValue}
          onChange={(e) => handleChange(parseInt(e.target.value))}
          aria-labelledby={`${sliderId}-label`}
          aria-describedby={question.helper_text ? `${sliderId}-helper` : undefined}
          aria-valuenow={localValue}
          aria-valuemin={question.min}
          aria-valuemax={question.max}
          className="absolute inset-x-0 top-0 w-full h-16 opacity-0 cursor-pointer touch-manipulation"
        />

        {/* Custom thumb indicator - larger on mobile */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 pointer-events-none',
            'w-7 h-7 sm:w-6 sm:h-6',
            'bg-white border-4 border-coral-500 rounded-full shadow-lg'
          )}
          style={{ left: `calc(${percentage}% - 14px)` }}
          initial={false}
          animate={{ left: `calc(${percentage}% - 14px)` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          aria-hidden="true"
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-gray-500 px-1">
        <span className="max-w-[45%] text-left">
          {question.labels?.[question.min] || question.min}
        </span>
        <span className="max-w-[45%] text-right">
          {question.labels?.[question.max] || question.max}
        </span>
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// =====================================================
// RANKING QUESTION (Drag & Drop)
// =====================================================

interface RankingQuestionProps {
  question: RankingQ;
  value: string[] | null;
  onChange: (value: string[]) => void;
  error?: string;
}

export function RankingQuestion({ question, value, onChange, error }: RankingQuestionProps) {
  const [items, setItems] = useState<SelectOption[]>(() => {
    if (value && value.length > 0) {
      // Sort options by value order
      return [...question.options].sort((a, b) => {
        const indexA = value.indexOf(a.value);
        const indexB = value.indexOf(b.value);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }
    return question.options;
  });
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleReorder = (newItems: SelectOption[]) => {
    setItems(newItems);
    onChange(newItems.map((item) => item.value));
  };

  // Move item up or down with keyboard
  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    setItems(newItems);
    onChange(newItems.map((item) => item.value));
    setFocusedIndex(toIndex);
  }, [items, onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        moveItem(index, index - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveItem(index, index + 1);
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        setFocusedIndex(index);
        break;
    }
  }, [moveItem]);

  return (
    <div className="space-y-4">
      <label id={`${question.id}-label`} className="block text-base font-medium text-gray-900">
        {question.label}
        {question.required && <span className="text-coral-500 ml-1">*</span>}
      </label>

      {question.instruction && (
        <p id={`${question.id}-instruction`} className="text-sm text-gray-500">
          {question.instruction}
          <span className="block mt-1 text-xs text-gray-400">
            Gebruik pijltjestoetsen om te herschikken
          </span>
        </p>
      )}

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        className="space-y-2"
        role="listbox"
        aria-labelledby={`${question.id}-label`}
        aria-describedby={question.instruction ? `${question.id}-instruction` : undefined}
      >
        {items.map((item, index) => (
          <Reorder.Item
            key={item.value}
            value={item}
            className="cursor-grab active:cursor-grabbing outline-none"
            tabIndex={0}
            role="option"
            aria-selected={focusedIndex === index}
            aria-label={`${item.label}, positie ${index + 1} van ${items.length}. Gebruik pijltjes om te verplaatsen.`}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
          >
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex items-center gap-3 p-4 bg-white rounded-xl border-2 transition-colors',
                index === 0
                  ? 'border-coral-300 bg-coral-50'
                  : 'border-gray-200 hover:border-gray-300',
                focusedIndex === index && 'ring-2 ring-coral-500 ring-offset-2'
              )}
            >
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                <ChevronUp
                  className={cn(
                    'w-4 h-4 transition-opacity',
                    index === 0 ? 'opacity-20' : 'opacity-40'
                  )}
                />
                <GripVertical className="w-5 h-5 text-gray-400" />
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-opacity',
                    index === items.length - 1 ? 'opacity-20' : 'opacity-40'
                  )}
                />
              </div>
              <span
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
                  index === 0 ? 'bg-coral-500 text-white' : 'bg-gray-100 text-gray-600'
                )}
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="flex-1 text-gray-900">{item.label}</span>
              {index === 0 && (
                <span className="text-xs text-coral-600 font-medium hidden sm:block">
                  Meest frustrerend
                </span>
              )}
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// =====================================================
// MULTI-SELECT QUESTION
// =====================================================

interface MultiSelectQuestionProps {
  question: MultiSelectQ;
  value: string[] | null;
  onChange: (value: string[]) => void;
  error?: string;
}

export function MultiSelectQuestion({
  question,
  value,
  onChange,
  error,
}: MultiSelectQuestionProps) {
  const selected = value || [];
  const groupId = `multiselect-${question.id}`;

  const toggleOption = (optionValue: string) => {
    if (selected.includes(optionValue)) {
      onChange(selected.filter((v) => v !== optionValue));
    } else {
      if (question.max_selections && selected.length >= question.max_selections) {
        return; // Max reached
      }
      onChange([...selected, optionValue]);
    }
  };

  return (
    <div className="space-y-4">
      <label
        id={`${groupId}-label`}
        className="block text-base font-medium text-gray-900"
      >
        {question.label}
        {question.required && <span className="text-coral-500 ml-1" aria-hidden="true">*</span>}
        {question.required && <span className="sr-only">(verplicht)</span>}
      </label>

      {question.helper_text && (
        <p id={`${groupId}-helper`} className="text-sm text-gray-500">
          {question.helper_text}
        </p>
      )}

      <div
        role="group"
        aria-labelledby={`${groupId}-label`}
        aria-describedby={question.helper_text ? `${groupId}-helper` : undefined}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {question.options.map((option) => {
          const isSelected = selected.includes(option.value);
          const isDisabled =
            !isSelected &&
            question.max_selections !== undefined &&
            selected.length >= question.max_selections;

          return (
            <motion.button
              key={option.value}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              aria-disabled={isDisabled}
              aria-label={`${option.label}${option.description ? `: ${option.description}` : ''}`}
              onClick={() => toggleOption(option.value)}
              disabled={isDisabled}
              whileTap={{ scale: 0.97 }}
              className={cn(
                // Base styles with minimum touch target
                'relative p-4 rounded-xl border-2 text-left transition-all',
                'min-h-[56px] touch-manipulation',
                'focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2',
                isSelected
                  ? 'border-coral-500 bg-coral-50'
                  : isDisabled
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-coral-200 active:bg-coral-50/50'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-6 h-6 rounded flex-shrink-0 flex items-center justify-center border-2 mt-0.5',
                    isSelected
                      ? 'bg-coral-500 border-coral-500'
                      : 'border-gray-300'
                  )}
                  aria-hidden="true"
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-gray-900 text-base">{option.label}</span>
                  {option.description && (
                    <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {question.max_selections && (
        <p className="text-xs text-gray-400" aria-live="polite">
          {selected.length} / {question.max_selections} geselecteerd
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// =====================================================
// SELECT QUESTION (Single choice)
// =====================================================

interface SelectQuestionProps {
  question: SelectQ;
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
}

export function SelectQuestion({ question, value, onChange, error }: SelectQuestionProps) {
  const options = question.options as SelectOption[];
  const groupId = `select-${question.id}`;

  // Use card-style for <= 5 options, dropdown for more
  const useCards = options.length <= 5;

  if (useCards) {
    return (
      <div className="space-y-4">
        <label
          id={`${groupId}-label`}
          className="block text-base font-medium text-gray-900"
        >
          {question.label}
          {question.required && <span className="text-coral-500 ml-1" aria-hidden="true">*</span>}
          {question.required && <span className="sr-only">(verplicht)</span>}
        </label>

        {question.helper_text && (
          <p id={`${groupId}-helper`} className="text-sm text-gray-500">
            {question.helper_text}
          </p>
        )}

        <div
          role="radiogroup"
          aria-labelledby={`${groupId}-label`}
          aria-describedby={question.helper_text ? `${groupId}-helper` : undefined}
          className="space-y-2"
        >
          {options.map((option) => (
            <motion.button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={value === option.value}
              aria-label={`${option.label}${option.description ? `: ${option.description}` : ''}`}
              onClick={() => onChange(option.value)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                // Base styles with minimum touch target
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                'min-h-[56px] touch-manipulation',
                'focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2',
                value === option.value
                  ? 'border-coral-500 bg-coral-50'
                  : 'border-gray-200 hover:border-coral-200 active:bg-coral-50/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2',
                    value === option.value
                      ? 'bg-coral-500 border-coral-500'
                      : 'border-gray-300'
                  )}
                  aria-hidden="true"
                >
                  {value === option.value && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900 text-base">{option.label}</span>
                  {option.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Dropdown for many options - mobile optimized
  return (
    <div className="space-y-4">
      <label
        htmlFor={groupId}
        className="block text-base font-medium text-gray-900"
      >
        {question.label}
        {question.required && <span className="text-coral-500 ml-1" aria-hidden="true">*</span>}
        {question.required && <span className="sr-only">(verplicht)</span>}
      </label>

      {question.helper_text && (
        <p id={`${groupId}-helper`} className="text-sm text-gray-500">
          {question.helper_text}
        </p>
      )}

      <div className="relative">
        <select
          id={groupId}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={question.helper_text ? `${groupId}-helper` : undefined}
          aria-invalid={!!error}
          className={cn(
            'w-full p-4 pr-10 rounded-xl border-2 bg-white appearance-none cursor-pointer transition-all',
            'focus:outline-none focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20',
            // Mobile: 16px font prevents iOS zoom on focus
            'text-base',
            'touch-manipulation',
            'min-h-[56px]',
            value ? 'border-coral-500' : error ? 'border-red-300' : 'border-gray-200'
          )}
        >
          <option value="" disabled>
            {question.placeholder || 'Selecteer een optie...'}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden="true" />
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// =====================================================
// TEXT QUESTION
// =====================================================

interface TextQuestionProps {
  question: TextQ;
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
}

export function TextQuestion({ question, value, onChange, error }: TextQuestionProps) {
  const isTextarea = question.type === 'textarea';
  const maxLength = question.validation?.max_length;
  const inputId = `text-${question.id}`;

  return (
    <div className="space-y-4">
      <label
        htmlFor={inputId}
        className="block text-base font-medium text-gray-900"
      >
        {question.label}
        {question.required && <span className="text-coral-500 ml-1" aria-hidden="true">*</span>}
        {question.required && <span className="sr-only">(verplicht)</span>}
      </label>

      {question.helper_text && (
        <p id={`${inputId}-helper`} className="text-sm text-gray-500">
          {question.helper_text}
        </p>
      )}

      {isTextarea ? (
        <textarea
          id={inputId}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          maxLength={maxLength}
          rows={4}
          aria-describedby={question.helper_text ? `${inputId}-helper` : undefined}
          aria-invalid={!!error}
          className={cn(
            'w-full p-4 rounded-xl border-2 bg-white transition-all resize-none',
            'focus:outline-none focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20',
            'placeholder:text-gray-400',
            // Mobile: 16px font prevents iOS zoom on focus
            'text-base sm:text-sm',
            'touch-manipulation',
            error ? 'border-red-300' : 'border-gray-200'
          )}
        />
      ) : (
        <input
          id={inputId}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          maxLength={maxLength}
          aria-describedby={question.helper_text ? `${inputId}-helper` : undefined}
          aria-invalid={!!error}
          // Disable autocorrect for names etc
          autoCorrect="off"
          autoCapitalize="words"
          className={cn(
            'w-full p-4 rounded-xl border-2 bg-white transition-all',
            'focus:outline-none focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20',
            'placeholder:text-gray-400',
            // Mobile: 16px font prevents iOS zoom on focus
            'text-base sm:text-sm',
            'touch-manipulation',
            error ? 'border-red-300' : 'border-gray-200'
          )}
        />
      )}

      <div className="flex justify-between items-start gap-2">
        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {maxLength && (
          <p className="text-xs text-gray-400 ml-auto flex-shrink-0">
            {(value || '').length} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

// =====================================================
// NUMBER QUESTION
// =====================================================

interface NumberQuestionProps {
  question: Question & { type: 'number'; min?: number; max?: number };
  value: number | null;
  onChange: (value: number) => void;
  error?: string;
}

export function NumberQuestion({ question, value, onChange, error }: NumberQuestionProps) {
  const inputId = `number-${question.id}`;

  return (
    <div className="space-y-4">
      <label
        htmlFor={inputId}
        className="block text-base font-medium text-gray-900"
      >
        {question.label}
        {question.required && <span className="text-coral-500 ml-1" aria-hidden="true">*</span>}
        {question.required && <span className="sr-only">(verplicht)</span>}
      </label>

      {question.helper_text && (
        <p id={`${inputId}-helper`} className="text-sm text-gray-500">
          {question.helper_text}
        </p>
      )}

      <input
        id={inputId}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value ?? ''}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        placeholder={question.placeholder}
        min={question.min}
        max={question.max}
        aria-describedby={question.helper_text ? `${inputId}-helper` : undefined}
        aria-invalid={!!error}
        className={cn(
          'w-full p-4 rounded-xl border-2 bg-white transition-all',
          'focus:outline-none focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20',
          'placeholder:text-gray-400',
          // Mobile: 16px font prevents iOS zoom on focus
          'text-base sm:text-sm',
          'touch-manipulation',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          error ? 'border-red-300' : 'border-gray-200'
        )}
      />

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// =====================================================
// BOOLEAN QUESTION
// =====================================================

interface BooleanQuestionProps {
  question: BooleanQ;
  value: boolean | null;
  onChange: (value: boolean) => void;
  error?: string;
}

export function BooleanQuestion({ question, value, onChange, error }: BooleanQuestionProps) {
  const groupId = `boolean-${question.id}`;

  return (
    <div className="space-y-4">
      <label
        id={`${groupId}-label`}
        className="block text-base font-medium text-gray-900"
      >
        {question.label}
        {question.required && <span className="text-coral-500 ml-1" aria-hidden="true">*</span>}
        {question.required && <span className="sr-only">(verplicht)</span>}
      </label>

      {question.description && (
        <p id={`${groupId}-desc`} className="text-sm text-gray-500">
          {question.description}
        </p>
      )}

      <div
        role="radiogroup"
        aria-labelledby={`${groupId}-label`}
        aria-describedby={question.description ? `${groupId}-desc` : undefined}
        className="flex gap-3"
      >
        {question.options.map((option) => (
          <motion.button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            whileTap={{ scale: 0.97 }}
            className={cn(
              // Base styles with minimum touch target
              'flex-1 p-4 rounded-xl border-2 font-medium transition-all',
              'min-h-[56px] touch-manipulation',
              'focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2',
              'text-base',
              value === option.value
                ? 'border-coral-500 bg-coral-50 text-coral-700'
                : 'border-gray-200 hover:border-coral-200 active:bg-coral-50/50 text-gray-700'
            )}
          >
            {option.label}
          </motion.button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// =====================================================
// QUESTION RENDERER
// =====================================================

interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function QuestionRenderer({ question, value, onChange, error }: QuestionRendererProps) {
  switch (question.type) {
    case 'text':
    case 'textarea':
      return (
        <TextQuestion
          question={question as TextQ}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    case 'number':
      return (
        <NumberQuestion
          question={question as any}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    case 'select':
      return (
        <SelectQuestion
          question={question as SelectQ}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    case 'multi_select':
      return (
        <MultiSelectQuestion
          question={question as MultiSelectQ}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    case 'scale':
      return (
        <ScaleQuestion
          question={question as ScaleQ}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    case 'slider':
      return (
        <SliderQuestion
          question={question as SliderQ}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    case 'ranking':
      return (
        <RankingQuestion
          question={question as RankingQ}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    case 'boolean':
      return (
        <BooleanQuestion
          question={question as BooleanQ}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    default:
      return <div>Unknown question type</div>;
  }
}
