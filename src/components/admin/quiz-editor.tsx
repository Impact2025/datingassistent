"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit2, Check, X, MoveUp, MoveDown } from 'lucide-react';

type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface QuizQuestion {
  id: string;
  question: string;
  options: Record<OptionKey, string>;
  answer: OptionKey | OptionKey[]; // Can be single or multiple correct answers
  feedback: Record<OptionKey, string>;
  multipleAnswers?: boolean; // Flag to indicate if multiple answers are allowed
  isPoll?: boolean; // Flag to indicate if this is a poll/survey question (no correct answer)
}

export interface QuizData {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

interface QuizEditorProps {
  value: QuizData;
  onChange: (value: QuizData) => void;
}

export function QuizEditor({ value, onChange }: QuizEditorProps) {
  // State for quiz editor
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionForm, setQuestionForm] = useState<QuizQuestion>({
    id: '',
    question: '',
    options: { A: '', B: '', C: '', D: '' },
    answer: 'A',
    feedback: { A: '', B: '', C: '', D: '' },
  });

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q${Date.now()}`,
      question: '',
      options: { A: '', B: '', C: '', D: '' },
      answer: 'A',
      feedback: { A: '', B: '', C: '', D: '' },
      multipleAnswers: false,
      isPoll: false,
    };
    setQuestionForm(newQuestion);
    setEditingQuestionId(newQuestion.id);
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setQuestionForm({ ...question });
    setEditingQuestionId(question.id);
  };

  const handleSaveQuestion = () => {
    if (!questionForm.question.trim()) {
      alert('Voer een vraag in');
      return;
    }

    if (!questionForm.options.A || !questionForm.options.B) {
      alert('Vul minstens antwoord A en B in');
      return;
    }

    const existingIndex = value.questions.findIndex(q => q.id === questionForm.id);
    let updatedQuestions;

    if (existingIndex >= 0) {
      // Update existing question
      updatedQuestions = [...value.questions];
      updatedQuestions[existingIndex] = questionForm;
    } else {
      // Add new question
      updatedQuestions = [...value.questions, questionForm];
    }

    onChange({ ...value, questions: updatedQuestions });
    setEditingQuestionId(null);
    setQuestionForm({
      id: '',
      question: '',
      options: { A: '', B: '', C: '', D: '' },
      answer: 'A',
      feedback: { A: '', B: '', C: '', D: '' },
    });
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setQuestionForm({
      id: '',
      question: '',
      options: { A: '', B: '', C: '', D: '' },
      answer: 'A',
      feedback: { A: '', B: '', C: '', D: '' },
    });
  };

  const handleDeleteQuestion = (id: string) => {
    if (!confirm('Weet je zeker dat je deze vraag wilt verwijderen?')) return;
    onChange({
      ...value,
      questions: value.questions.filter(q => q.id !== id),
    });
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...value.questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    onChange({ ...value, questions: newQuestions });
  };

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="quiz-title">Quiz Titel</Label>
          <Input
            id="quiz-title"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            placeholder="Bijv: Test je kennis over dating veiligheid"
          />
        </div>
        <div>
          <Label htmlFor="quiz-description">Quiz Beschrijving</Label>
          <Textarea
            id="quiz-description"
            value={value.description}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
            placeholder="Leg uit waar de quiz over gaat..."
            rows={2}
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Vragen ({value.questions.length})</h3>
          <Button onClick={handleAddQuestion} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Vraag Toevoegen
          </Button>
        </div>

        {/* Show new question editor if editing a question that doesn't exist yet */}
        {editingQuestionId && !value.questions.find(q => q.id === editingQuestionId) && (
          <Card className="border-2 border-primary">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <Label>Nieuwe Vraag</Label>
                  <Textarea
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    placeholder="Typ hier je vraag..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {(['A', 'B', 'C', 'D'] as OptionKey[]).map((key) => (
                    <div key={key} className="space-y-2">
                      <Label>Antwoord {key}</Label>
                      <Input
                        value={questionForm.options[key]}
                        onChange={(e) => setQuestionForm({
                          ...questionForm,
                          options: { ...questionForm.options, [key]: e.target.value }
                        })}
                        placeholder={`Antwoord ${key}${key === 'A' || key === 'B' ? ' (verplicht)' : ' (optioneel)'}`}
                      />
                      <Textarea
                        value={questionForm.feedback[key]}
                        onChange={(e) => setQuestionForm({
                          ...questionForm,
                          feedback: { ...questionForm.feedback, [key]: e.target.value }
                        })}
                        placeholder={`Feedback voor antwoord ${key}`}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-3 p-3 border rounded-lg bg-secondary/30">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-poll"
                      checked={questionForm.isPoll}
                      onCheckedChange={(checked) => {
                        setQuestionForm({
                          ...questionForm,
                          isPoll: checked === true
                        });
                      }}
                    />
                    <Label htmlFor="is-poll" className="cursor-pointer font-medium">
                      Dit is een poll/enquête vraag (geen juist/fout antwoord)
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    Gebruik dit voor meningen, voorkeuren of zelfreflectie vragen waarbij er geen correct antwoord is.
                  </p>
                </div>

                {!questionForm.isPoll && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="multiple-answers"
                        checked={questionForm.multipleAnswers}
                        onCheckedChange={(checked) => {
                          const isMultiple = checked === true;
                          setQuestionForm({
                            ...questionForm,
                            multipleAnswers: isMultiple,
                            answer: isMultiple ? [] : 'A' // Reset to empty array or single answer
                          });
                        }}
                      />
                      <Label htmlFor="multiple-answers" className="cursor-pointer">
                        Meerdere juiste antwoorden mogelijk
                      </Label>
                    </div>

                    {questionForm.multipleAnswers ? (
                      // Multiple answers - show checkboxes
                      <div>
                        <Label>Juiste Antwoorden (selecteer alle correcte opties)</Label>
                        <div className="space-y-2 mt-2">
                          {(['A', 'B', 'C', 'D'] as OptionKey[])
                            .filter(key => questionForm.options[key])
                            .map(key => {
                              const answers = Array.isArray(questionForm.answer) ? questionForm.answer : [];
                              const isChecked = answers.includes(key);
                              return (
                                <div key={key} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`answer-${key}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      const currentAnswers = Array.isArray(questionForm.answer) ? questionForm.answer : [];
                                      const newAnswers = checked
                                        ? [...currentAnswers, key]
                                        : currentAnswers.filter(a => a !== key);
                                      setQuestionForm({ ...questionForm, answer: newAnswers });
                                    }}
                                  />
                                  <Label htmlFor={`answer-${key}`} className="cursor-pointer">
                                    {key}: {questionForm.options[key]}
                                  </Label>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      // Single answer - show dropdown
                      <div>
                        <Label>Juiste Antwoord</Label>
                        <Select
                          value={Array.isArray(questionForm.answer) ? questionForm.answer[0] || 'A' : questionForm.answer}
                          onValueChange={(value: OptionKey) => setQuestionForm({ ...questionForm, answer: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(['A', 'B', 'C', 'D'] as OptionKey[])
                              .filter(key => questionForm.options[key])
                              .map(key => (
                                <SelectItem key={key} value={key}>
                                  {key}: {questionForm.options[key]}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleSaveQuestion} size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Opslaan
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Annuleren
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {value.questions.map((question, index) => (
          <Card key={question.id} className="border-2">
            <CardContent className="p-4">
              {editingQuestionId === question.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <Label>Vraag {index + 1}</Label>
                    <Textarea
                      value={questionForm.question}
                      onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                      placeholder="Typ hier je vraag..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {(['A', 'B', 'C', 'D'] as OptionKey[]).map((key) => (
                      <div key={key} className="space-y-2">
                        <Label>Antwoord {key}</Label>
                        <Input
                          value={questionForm.options[key]}
                          onChange={(e) => setQuestionForm({
                            ...questionForm,
                            options: { ...questionForm.options, [key]: e.target.value }
                          })}
                          placeholder={`Antwoord ${key}${key === 'A' || key === 'B' ? ' (verplicht)' : ' (optioneel)'}`}
                        />
                        <Textarea
                          value={questionForm.feedback[key]}
                          onChange={(e) => setQuestionForm({
                            ...questionForm,
                            feedback: { ...questionForm.feedback, [key]: e.target.value }
                          })}
                          placeholder={`Feedback voor antwoord ${key}`}
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 p-3 border rounded-lg bg-secondary/30">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is-poll-edit"
                        checked={questionForm.isPoll}
                        onCheckedChange={(checked) => {
                          setQuestionForm({
                            ...questionForm,
                            isPoll: checked === true
                          });
                        }}
                      />
                      <Label htmlFor="is-poll-edit" className="cursor-pointer font-medium">
                        Dit is een poll/enquête vraag (geen juist/fout antwoord)
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Gebruik dit voor meningen, voorkeuren of zelfreflectie vragen waarbij er geen correct antwoord is.
                    </p>
                  </div>

                  {!questionForm.isPoll && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="multiple-answers-edit"
                          checked={questionForm.multipleAnswers}
                          onCheckedChange={(checked) => {
                            const isMultiple = checked === true;
                            setQuestionForm({
                              ...questionForm,
                              multipleAnswers: isMultiple,
                              answer: isMultiple ? [] : 'A' // Reset to empty array or single answer
                            });
                          }}
                        />
                        <Label htmlFor="multiple-answers-edit" className="cursor-pointer">
                          Meerdere juiste antwoorden mogelijk
                        </Label>
                      </div>

                      {questionForm.multipleAnswers ? (
                        // Multiple answers - show checkboxes
                        <div>
                          <Label>Juiste Antwoorden (selecteer alle correcte opties)</Label>
                          <div className="space-y-2 mt-2">
                            {(['A', 'B', 'C', 'D'] as OptionKey[])
                              .filter(key => questionForm.options[key])
                              .map(key => {
                                const answers = Array.isArray(questionForm.answer) ? questionForm.answer : [];
                                const isChecked = answers.includes(key);
                                return (
                                  <div key={key} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`answer-edit-${key}`}
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        const currentAnswers = Array.isArray(questionForm.answer) ? questionForm.answer : [];
                                        const newAnswers = checked
                                          ? [...currentAnswers, key]
                                          : currentAnswers.filter(a => a !== key);
                                        setQuestionForm({ ...questionForm, answer: newAnswers });
                                      }}
                                    />
                                    <Label htmlFor={`answer-edit-${key}`} className="cursor-pointer">
                                      {key}: {questionForm.options[key]}
                                    </Label>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ) : (
                        // Single answer - show dropdown
                        <div>
                          <Label>Juiste Antwoord</Label>
                          <Select
                            value={Array.isArray(questionForm.answer) ? questionForm.answer[0] || 'A' : questionForm.answer}
                            onValueChange={(value: OptionKey) => setQuestionForm({ ...questionForm, answer: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(['A', 'B', 'C', 'D'] as OptionKey[])
                                .filter(key => questionForm.options[key])
                                .map(key => (
                                  <SelectItem key={key} value={key}>
                                    {key}: {questionForm.options[key]}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleSaveQuestion} size="sm">
                      <Check className="h-4 w-4 mr-2" />
                      Opslaan
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Annuleren
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-primary">Vraag {index + 1}</span>
                        {question.isPoll ? (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Poll/Enquête
                          </span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Correct: {Array.isArray(question.answer) ? question.answer.join(', ') : question.answer}
                          </span>
                        )}
                      </div>
                      <p className="font-medium mb-2">{question.question}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {(['A', 'B', 'C', 'D'] as OptionKey[])
                          .filter(key => question.options[key])
                          .map(key => {
                            const isCorrect = Array.isArray(question.answer)
                              ? question.answer.includes(key)
                              : question.answer === key;
                            return (
                              <div key={key} className={!question.isPoll && isCorrect ? 'text-green-700 font-medium' : 'text-muted-foreground'}>
                                <strong>{key}:</strong> {question.options[key]}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        onClick={() => handleMoveQuestion(index, 'up')}
                        disabled={index === 0}
                        variant="ghost"
                        size="sm"
                        title="Omhoog"
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleMoveQuestion(index, 'down')}
                        disabled={index === value.questions.length - 1}
                        variant="ghost"
                        size="sm"
                        title="Omlaag"
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleEditQuestion(question)}
                        variant="ghost"
                        size="sm"
                        title="Bewerken"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteQuestion(question.id)}
                        variant="ghost"
                        size="sm"
                        title="Verwijderen"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {value.questions.length === 0 && !editingQuestionId && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">Nog geen vragen toegevoegd</p>
            <Button onClick={handleAddQuestion} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Eerste Vraag Toevoegen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
