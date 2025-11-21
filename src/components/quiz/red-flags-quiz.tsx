"use client";

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import * as Lucide from 'lucide-react';

type OptionKey = 'A' | 'B' | 'C' | 'D';

interface QuizQuestion {
  id: string;
  question: string;
  options: Record<OptionKey, string>;
  answer: OptionKey;
  feedback: Record<OptionKey, string>;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question:
      'Je matcht met iemand en na slechts een paar uur chatten zegt die persoon: “Ik heb nog nooit iemand zoals jij ontmoet, ik denk dat jij de ware bent.” Welke red flag is dit het duidelijkste voorbeeld van?',
    options: {
      A: 'Catfishing',
      B: 'Love Bombing',
      C: 'Ghosting',
      D: 'Gezonde romantische interesse',
    },
    answer: 'B',
    feedback: {
      A: 'Catfishing gaat over een valse identiteit, niet per se over de snelheid van emotionele verklaringen.',
      B: 'Correct! Overladen worden met overdreven liefde in korte tijd is typisch love bombing – een manipulatieve tactiek.',
      C: 'Ghosting is juist het plotseling verbreken van alle communicatie; het tegenovergestelde van dit gedrag.',
      D: 'Echte interesse groeit met tijd. Deze snelle, diepe uitspraken zijn onrealistisch en daarom verdacht.',
    },
  },
  {
    id: 'q2',
    question:
      'Je wilt graag een videogesprek voeren met je match voordat je afspreekt, maar hij/zij heeft elke keer een excuus (“camera stuk”, “slechte verbinding”). Wat is de meest waarschijnlijke red flag?',
    options: {
      A: 'Inconsistente communicatie',
      B: 'Love Bombing',
      C: 'Catfishing',
      D: 'Verlegenheid',
    },
    answer: 'C',
    feedback: {
      A: 'Ze reageren wel, alleen vermijden ze video. Dit is iets anders dan onvoorspelbare communicatie.',
      B: 'Er is geen sprake van overdreven affectie. Het draait juist om vermijden.',
      C: 'Correct! Het ontwijken van video wijst op het verbergen van identiteit – een klassiek catfishing-signaal.',
      D: 'Verlegenheid kan meespelen, maar consequent uitwijken met smoesjes is een duidelijke rode vlag.',
    },
  },
  {
    id: 'q3',
    question:
      'Je date eist na een week chatten dat je de datingapp verwijdert en constant je locatie deelt. Hoe wordt dit gedrag genoemd?',
    options: {
      A: 'Betrokkenheid tonen',
      B: 'Controlerend en grensoverschrijdend gedrag',
      C: 'Sextortion',
      D: 'Pig Butchering',
    },
    answer: 'B',
    feedback: {
      A: 'Betrokkenheid is gebaseerd op vertrouwen, niet op eisen en controle.',
      B: 'Correct! Dit zijn duidelijke signalen van controle en mogelijk misbruik.',
      C: 'Sextortion is afpersing met intieme beelden; dat gebeurt hier niet.',
      D: 'Pig butchering gaat over belegging-oplichting, niet gedragscontrole.',
    },
  },
  {
    id: 'q4',
    question: 'Wat is een duidelijk teken van “inconsistente communicatie”?',
    options: {
      A: 'Elke dag op hetzelfde tijdstip een berichtje sturen.',
      B: 'Een paar uur wachten met reageren omdat iemand het druk heeft.',
      C: 'Hot-and-cold gedrag: dagenlang intense gesprekken, gevolgd door een week radiostilte.',
      D: 'Aangeven dat ze in het weekend minder op hun telefoon zitten.',
    },
    answer: 'C',
    feedback: {
      A: 'Dit is juist zeer voorspelbaar en consistent.',
      B: 'Een paar uur wachten is normaal; het gaat om langere, onverklaarbare stiltes.',
      C: 'Correct! Afwisselend overdreven aandacht en stilte is de kern van inconsistent gedrag.',
      D: 'Grenzen aangeven over telefoongebruik is gezond, geen rood vlag-signaal.',
    },
  },
  {
    id: 'q5',
    question:
      'Je match vraagt om een “kleine lening” voor medische kosten van een familielid. Wat is de juiste reactie?',
    options: {
      A: 'Een klein bedrag lenen om het risico te beperken.',
      B: 'Emotionele steun bieden maar geen geld geven.',
      C: 'Contact verbreken, niet betalen en rapporteren.',
      D: 'Voorstellen om het geld persoonlijk te overhandigen.',
    },
    answer: 'C',
    feedback: {
      A: 'Zelfs een klein bedrag bevestigt dat je betaalbereid bent – gevaarlijk.',
      B: 'Geen geld geven is goed, maar verbreek ook meteen het contact.',
      C: 'Correct! Geldverzoeken = directe red flag. Blokkeer en rapporteer.',
      D: 'Een ontmoeting voor geld maakt je extra kwetsbaar. Niet doen.',
    },
  },
  {
    id: 'q6',
    question:
      'Wat is een effectieve eerste stap om de identiteit van een online match te verifiëren?',
    options: {
      A: 'Hun social media profielen bekijken.',
      B: 'Een reverse image search uitvoeren op profielfoto’s.',
      C: 'Vragen naar volledige naam en woonplaats.',
      D: 'Alle berichten analyseren op inconsistenties.',
    },
    answer: 'B',
    feedback: {
      A: 'Goed, maar nepaccounts kunnen ook fake socials hebben.',
      B: 'Correct! Reverse image search onthult snel of foto’s ergens anders gebruikt worden.',
      C: 'Een oplichter verzint gemakkelijk gegevens; geen betrouwbare check.',
      D: 'Handig, maar minder snel en minder sluitend dan een reverse search.',
    },
  },
  {
    id: 'q7',
    question: 'Voor een eerste date is het het veiligst om af te spreken…',
    options: {
      A: 'Bij jou thuis, zodat je in een vertrouwde omgeving bent.',
      B: 'In een druk, openbaar café of restaurant.',
      C: 'In een rustig park voor een romantische wandeling.',
      D: 'Halverwege, waarbij je door je date wordt opgehaald.',
    },
    answer: 'B',
    feedback: {
      A: 'Thuis afspreken met een vreemde is onveilig. Deel je adres niet.',
      B: 'Correct! Een openbare plek geeft controle en veiligheid.',
      C: 'Afgelegen plekken zijn riskant voor een eerste ontmoeting.',
      D: 'Laat je niet ophalen door iemand die je niet kent; zorg voor eigen vervoer.',
    },
  },
  {
    id: 'q8',
    question:
      'Een match wil het gesprek heel snel van de datingapp naar WhatsApp verplaatsen. Waarom is dit een potentieel risico?',
    options: {
      A: 'Omdat WhatsApp minder populair is.',
      B: 'Omdat je direct je telefoonnummer deelt.',
      C: 'Omdat datingapps betere chatfuncties hebben.',
      D: 'Omdat de persoon niet serieus is.',
    },
    answer: 'B',
    feedback: {
      A: 'Populariteit speelt geen rol; privacy wel.',
      B: 'Correct! Je geeft persoonlijke info en verliest app-beveiliging.',
      C: 'Chatkwaliteit is niet het issue; veiligheid wel.',
      D: 'Serieuze intentie zegt niets over platformkeuze – privacy is de kern.',
    },
  },
  {
    id: 'q9',
    question:
      'De nieuwe vorm van datingfraude waarbij oplichters je overtuigen om te investeren in crypto heet…',
    options: {
      A: 'Sextortion',
      B: 'Catfishing',
      C: 'Ghosting',
      D: 'Pig Butchering',
    },
    answer: 'D',
    feedback: {
      A: 'Sextortion draait om dreiging met intieme beelden.',
      B: 'Catfishing is de methode, maar deze oplichting heeft een eigen naam.',
      C: 'Ghosting is enkel het verbreken van contact.',
      D: 'Correct! Pig butchering = emotioneel “vetmesten” om daarna financieel te slaan.',
    },
  },
  {
    id: 'q10',
    question:
      'Je voelt je ongemakkelijk bij het gedrag van een match en twijfelt. Wat is de beste vuistregel?',
    options: {
      A: 'Ignoreren en hopen dat het beter wordt.',
      B: 'Confronteren en om uitleg vragen.',
      C: 'Vrienden om advies vragen en hun oordeel volgen.',
      D: 'Vertrouw op je instinct: blokkeren en verdergaan.',
    },
    answer: 'D',
    feedback: {
      A: 'Negeer je gevoel niet – dat vergroot risico.',
      B: 'Confrontatie kan escaleren. Jouw veiligheid eerst.',
      C: 'Advies is nuttig, maar jij voelt de situatie het beste aan.',
      D: 'Correct! Twijfel = stop. Je intuïtie is je vangnet.',
    },
  },
];

const SCORE_TIERS = [
  { min: 9, label: 'Top-presteerder', tone: 'Je radar is scherp. Deel je tips met anderen in de community.' },
  { min: 7, label: 'Goed bezig', tone: 'Je kent de meeste signalen. Herhaal de checklist regelmatig voor extra zekerheid.' },
  { min: 5, label: 'In de buurt', tone: 'Je herkent al veel red flags. Besteed extra aandacht aan financiële en identiteitsfraude.' },
  { min: 0, label: 'Tijd voor focus', tone: 'Geen stress, maar herhaal de lesstof. Gebruik de AI Veiligheidscheck voor extra begeleiding.' },
];

function getScoreSummary(correct: number) {
  const tier = SCORE_TIERS.find((item) => correct >= item.min) ?? SCORE_TIERS[SCORE_TIERS.length - 1];
  return tier;
}

interface RedFlagsQuizProps {
  onFinished?: (score: number, incorrectIds: string[]) => void;
}

export function RedFlagsQuiz({ onFinished }: RedFlagsQuizProps) {
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [showResults, setShowResults] = useState(false);

  const totalQuestions = QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const { correctCount, incorrectQuestions } = useMemo(() => {
    let correct = 0;
    const incorrect: string[] = [];
    QUESTIONS.forEach((question) => {
      const selected = answers[question.id];
      if (!selected) return;
      if (selected === question.answer) {
        correct += 1;
      } else {
        incorrect.push(question.id);
      }
    });
    return { correctCount: correct, incorrectQuestions: incorrect };
  }, [answers]);

  const summary = useMemo(() => getScoreSummary(correctCount), [correctCount]);

  const handleSubmit = () => {
    setShowResults(true);
    onFinished?.(correctCount, incorrectQuestions);
  };

  const resetQuiz = () => {
    setAnswers({});
    setShowResults(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Lucide.AlertTriangle className="mt-1 h-5 w-5 text-primary" />
          <div>
            <h3 className="text-xl font-semibold text-foreground">Herken jij de Red Flags bij Online Daten?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Kies per vraag het beste antwoord. Bekijk direct waarom dat antwoord klopt of niet – kennis = veiligheid.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <div className="mt-2 text-xs text-muted-foreground">
            {answeredCount} / {totalQuestions} vragen beantwoord
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {QUESTIONS.map((question, index) => {
          const selected = answers[question.id];
          const isAnswered = Boolean(selected);
          const isCorrect = selected === question.answer;
          return (
            <Card key={question.id} className="border-border/70 bg-secondary/60">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Vraag {index + 1}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">{question.question}</p>
                </div>
                <div className="space-y-2">
                  {(Object.keys(question.options) as OptionKey[]).map((optionKey) => {
                    const option = question.options[optionKey];
                    const selectedThis = selected === optionKey;
                    const showFeedback = isAnswered && selectedThis;
                    const correctOption = question.answer === optionKey;

                    return (
                      <div key={optionKey} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!showResults) {
                              setAnswers((prev) => ({ ...prev, [question.id]: optionKey }));
                            }
                          }}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition',
                            showResults
                              ? correctOption
                                ? 'border-green-500/70 bg-green-50/80 text-green-900'
                                : selectedThis
                                ? 'border-red-500/70 bg-red-50/80 text-red-900'
                                : 'border-border/60 bg-background'
                              : selectedThis
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border/60 bg-background hover:border-primary/60'
                          )}
                          disabled={showResults}
                          >
                          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs font-semibold">
                            {optionKey}
                          </span>
                          <span>{option}</span>
                        </button>
                        {showFeedback && (
                          <div
                            className={cn(
                              'rounded-lg border px-3 py-2 text-xs leading-relaxed',
                              isCorrect
                                ? 'border-green-500/50 bg-green-50 text-green-800'
                                : 'border-amber-500/50 bg-amber-50 text-amber-800'
                            )}
                          >
                            {question.feedback[optionKey]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {!showResults ? (
          <Button
            onClick={handleSubmit}
            disabled={answeredCount !== totalQuestions}
            className="w-full sm:w-auto"
          >
            Resultaat bekijken
          </Button>
        ) : (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button onClick={resetQuiz} variant="outline" className="w-full sm:w-auto">
              Opnieuw maken
            </Button>
          </div>
        )}
        {!showResults && answeredCount !== totalQuestions && (
          <span className="text-xs text-muted-foreground">Beantwoord alle vragen om je score te zien.</span>
        )}
      </div>

      {showResults && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Lucide.Star className="h-6 w-6 text-primary" />
            <div>
              <h4 className="text-lg font-semibold text-foreground">
                {summary.label} – {correctCount}/{totalQuestions} goed
              </h4>
              <p className="text-sm text-muted-foreground">{summary.tone}</p>
            </div>
          </div>
          {incorrectQuestions.length > 0 && (
            <div className="mt-4 rounded-lg bg-background/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tips voor verbetering
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {incorrectQuestions.map((id) => {
                  const question = QUESTIONS.find((item) => item.id === id);
                  if (!question) return null;
                  return (
                    <li key={`hint-${id}`}>
                      Herlees vraag {QUESTIONS.indexOf(question) + 1} – focus op: <strong>{question.options[question.answer]}</strong>.
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RedFlagsQuiz;
