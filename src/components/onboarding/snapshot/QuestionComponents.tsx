'use client';

/**
 * Dating Snapshot - Question Components
 *
 * World-class question components for the onboarding experience.
 * All components are mobile-first, accessible, and beautifully animated.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Check, GripVertical, ChevronDown } from 'lucide-react';
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
      <label className="block text-base font-medium text-gray-900">
        {question.label}
        {question.required && <span className="text-pink-500 ml-1">*</span>}
      </label>

      {question.helper_text && (
        <p className="text-sm text-gray-500">{question.helper_text}</p>
      )}

      <div className="flex justify-between gap-2">
        {options.map((num) => (
          <motion.button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex-1 py-4 px-2 rounded-xl border-2 text-center transition-all min-h-[60px] flex flex-col items-center justify-center',
              value === num
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-200 hover:border-pink-200 hover:bg-pink-25'
            )}
          >
            <span className="text-lg font-semibold">{num}</span>
            {question.labels?.[num] && (
              <span className="text-xs text-gray-500 mt-1 line-clamp-2">
                {question.labels[num]}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>{question.labels?.[question.min]}</span>
        <span>{question.labels?.[question.max]}</span>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
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
      <label className="block text-base font-medium text-gray-900">
        {question.label}
        {question.required && <span className="text-pink-500 ml-1">*</span>}
      </label>

      {question.helper_text && (
        <p className="text-sm text-gray-500">{question.helper_text}</p>
      )}

      {/* Value display */}
      <div className="text-center">
        <span className="text-4xl font-bold text-pink-600">
          {localValue}
          {question.unit && <span className="text-2xl ml-1">{question.unit}</span>}
        </span>
      </div>

      {/* Slider */}
      <div className="relative pt-2 pb-6">
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
            style={{ width: `${percentage}%` }}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
        <input
          ref={sliderRef}
          type="range"
          min={question.min}
          max={question.max}
          step={question.step}
          value={localValue}
          onChange={(e) => handleChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* Thumb indicator */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-pink-500 rounded-full shadow-lg pointer-events-none"
          style={{ left: `calc(${percentage}% - 12px)` }}
          initial={false}
          animate={{ left: `calc(${percentage}% - 12px)` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{question.labels?.[question.min] || question.min}</span>
        <span>{question.labels?.[question.max] || question.max}</span>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
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

  const handleReorder = (newItems: SelectOption[]) => {
    setItems(newItems);
    onChange(newItems.map((item) => item.value));
  };

  return (
    <div className="space-y-4">
      <label className="block text-base font-medium text-gray-900">
        {question.label}
        {question.required && <span className="text-pink-500 ml-1">*</span>}
      </label>

      {question.instruction && (
        <p className="text-sm text-gray-500">{question.instruction}</p>
      )}

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        className="space-y-2"
      >
        {items.map((item, index) => (
          <Reorder.Item
            key={item.value}
            value={item}
            className="cursor-grab active:cursor-grabbing"
          >
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex items-center gap-3 p-4 bg-white rounded-xl border-2 transition-colors',
                index === 0
                  ? 'border-pink-300 bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
                  index === 0 ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'
                )}
              >
                {index + 1}
              </span>
              <span className="flex-1 text-gray-900">{item.label}</span>
              {index === 0 && (
                <span className="text-xs text-pink-600 font-medium">Meest frustrerend</span>
              )}
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {error && <p className="text-sm text-red-500">{error}</p>}
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
      <label className="block text-base font-medium text-gray-900">
        {question.label}
        {question.required && <span className="text-pink-500 ml-1">*</span>}
      </label>

      {question.helper_text && (
        <p className="text-sm text-gray-500">{question.helper_text}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
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
              onClick={() => toggleOption(option.value)}
              disabled={isDisabled}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'relative p-4 rounded-xl border-2 text-left transition-all',
                isSelected
                  ? 'border-pink-500 bg-pink-50'
                  : isDisabled
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-pink-200'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 mt-0.5',
                    isSelected
                      ? 'bg-pink-500 border-pink-500'
                      : 'border-gray-300'
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <span className="font-medium text-gray-900">{option.label}</span>
                  {option.description && (
                    <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {question.max_selections && (
        <p className="text-xs text-gray-400">
          {selected.length} / {question.max_selections} geselecteerd
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
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

  // Use card-style for <= 4 options, dropdown for more
  const useCards = options.length <= 5;

  if (useCards) {
    return (
      <div className="space-y-4">
        <label className="block text-base font-medium text-gray-900">
          {question.label}
          {question.required && <span className="text-pink-500 ml-1">*</span>}
        </label>

        {question.helper_text && (
          <p className="text-sm text-gray-500">{question.helper_text}</p>
        )}

        <div className="space-y-2">
          {options.map((option) => (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                value === option.value
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-200'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2',
                    value === option.value
                      ? 'bg-pink-500 border-pink-500'
                      : 'border-gray-300'
                  )}
                >
                  {value === option.value && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{option.label}</span>
                  {option.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  // Dropdown for many options
  return (
    <div className="space-y-4">
      <label className="block text-base font-medium text-gray-900">
        {question.label}
        {question.required && <span className="text-pink-500 ml-1">*</span>}
      </label>

      {question.helper_text && (
        <p className="text-sm text-gray-500">{question.helper_text}</p>
      )}

      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full p-4 pr-10 rounded-xl border-2 bg-white appearance-none cursor-pointer transition-all',
            'focus:outline-none focus:border-pink-500',
            value ? 'border-pink-500' : 'border-gray-200'
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
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
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

  return (
    <div className="space-y-4">
      <label className="block text-base font-medium text-gray-900">
        {question.label}
        {question.required && <span className="text-pink-500 ml-1">*</span>}
      </label>

      {question.helper_text && (
        <p className="text-sm text-gray-500">{question.helper_text}</p>
      )}

      {isTextarea ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          maxLength={maxLength}
          rows={4}
          className={cn(
            'w-full p-4 rounded-xl border-2 bg-white transition-all resize-none',
            'focus:outline-none focus:border-pink-500',
            'placeholder:text-gray-400',
            error ? 'border-red-300' : 'border-gray-200'
          )}
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          maxLength={maxLength}
          className={cn(
            'w-full p-4 rounded-xl border-2 bg-white transition-all',
            'focus:outline-none focus:border-pink-500',
            'placeholder:text-gray-400',
            error ? 'border-red-300' : 'border-gray-200'
          )}
        />
      )}

      <div className="flex justify-between">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {maxLength && (
          <p className="text-xs text-gray-400 ml-auto">
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
  return (
    <div className="space-y-4">
      <label className="block text-base font-medium text-gray-900">
        {question.label}
        {question.required && <span className="text-pink-500 ml-1">*</span>}
      </label>

      {question.helper_text && (
        <p className="text-sm text-gray-500">{question.helper_text}</p>
      )}

      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        placeholder={question.placeholder}
        min={question.min}
        max={question.max}
        className={cn(
          'w-full p-4 rounded-xl border-2 bg-white transition-all',
          'focus:outline-none focus:border-pink-500',
          'placeholder:text-gray-400',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          error ? 'border-red-300' : 'border-gray-200'
        )}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
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
  return (
    <div className="space-y-4">
      <label className="block text-base font-medium text-gray-900">
        {question.label}
        {question.required && <span className="text-pink-500 ml-1">*</span>}
      </label>

      {question.description && (
        <p className="text-sm text-gray-500">{question.description}</p>
      )}

      <div className="flex gap-3">
        {question.options.map((option) => (
          <motion.button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'flex-1 p-4 rounded-xl border-2 font-medium transition-all',
              value === option.value
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-200 hover:border-pink-200 text-gray-700'
            )}
          >
            {option.label}
          </motion.button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
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
