'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, AlertCircle, Highlighter } from 'lucide-react';

interface ClaimIdentifierProps {
  titel: string;
  beschrijving: string;
  bronTekst: string;
  instructie: string;
  highlightMode?: boolean;
  aiSuggestie?: boolean;
  irisContext?: string;
  onComplete: (resultaten: any) => void;
  onPrevious?: () => void;
}

interface ClaimIdentifierResultaten {
  origineleTekst: string;
  geïdentificeerdeClaims: string[];
  highlightedTekst?: string;
  isValid: boolean;
}

export function ClaimIdentifier({
  titel,
  beschrijving,
  bronTekst,
  instructie,
  highlightMode = true,
  aiSuggestie = false,
  irisContext,
  onComplete,
  onPrevious
}: ClaimIdentifierProps) {
  const [geïdentificeerdeClaims, setGeïdentificeerdeClaims] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [highlightedTekst, setHighlightedTekst] = useState(bronTekst);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selected = selection.toString().trim();
      setSelectedText(selected);
    }
  };

  // Add selected text as claim
  const addClaim = () => {
    if (selectedText && !geïdentificeerdeClaims.includes(selectedText)) {
      setGeïdentificeerdeClaims(prev => [...prev, selectedText]);

      // Highlight in text if highlight mode is on
      if (highlightMode) {
        const highlighted = highlightedTekst.replace(
          selectedText,
          `<mark class="bg-yellow-200 px-1 rounded">${selectedText}</mark>`
        );
        setHighlightedTekst(highlighted);
      }

      setSelectedText('');
      // Clear selection
      window.getSelection()?.removeAllRanges();
    }
  };

  // Remove claim
  const removeClaim = (claimToRemove: string) => {
    setGeïdentificeerdeClaims(prev => prev.filter(claim => claim !== claimToRemove));

    // Remove highlighting
    if (highlightMode) {
      const unhighlighted = highlightedTekst.replace(
        `<mark class="bg-yellow-200 px-1 rounded">${claimToRemove}</mark>`,
        claimToRemove
      );
      setHighlightedTekst(unhighlighted);
    }
  };

  const handleSubmit = () => {
    const resultaten: ClaimIdentifierResultaten = {
      origineleTekst: bronTekst,
      geïdentificeerdeClaims,
      highlightedTekst: highlightMode ? highlightedTekst : undefined,
      isValid: geïdentificeerdeClaims.length > 0
    };

    setIsSubmitted(true);
    onComplete(resultaten);
  };

  const isValid = geïdentificeerdeClaims.length > 0;

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Claims Geïdentificeerd
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Je hebt {geïdentificeerdeClaims.length} claim{geïdentificeerdeClaims.length !== 1 ? 's' : ''} gevonden in je bio.
            </p>
          </CardContent>
        </Card>

        {/* Identified Claims */}
        <Card>
          <CardHeader>
            <CardTitle>Je Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {geïdentificeerdeClaims.map((claim, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Badge variant="outline" className="bg-yellow-100">
                    Claim {index + 1}
                  </Badge>
                  <span className="font-medium text-yellow-900">"{claim}"</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Highlighted Text (if applicable) */}
        {highlightMode && (
          <Card>
            <CardHeader>
              <CardTitle>Gemarkeerd in je tekst</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg"
                dangerouslySetInnerHTML={{ __html: highlightedTekst }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Highlighter className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{titel}</h2>
            <p className="text-gray-600 mt-2">{beschrijving}</p>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-yellow-600 text-sm">💡</span>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Hoe te werk:</h4>
              <p className="text-sm text-yellow-800 mb-2">{instructie}</p>
              <div className="text-sm text-yellow-800">
                <strong>Voorbeelden van claims:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>"Ik ben spontaan"</li>
                  <li>"Ik hou van reizen"</li>
                  <li>"Ik ben grappig"</li>
                  <li>"Ik ben avontuurlijk"</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Selection Area */}
      <Card>
        <CardHeader>
          <CardTitle>Je Bio Tekst</CardTitle>
          <p className="text-sm text-gray-600">Selecteer tekst om claims te markeren</p>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-text select-text"
            onMouseUp={handleTextSelection}
            dangerouslySetInnerHTML={{ __html: highlightedTekst }}
          />
        </CardContent>
      </Card>

      {/* Selected Text & Add Button */}
      {selectedText && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-900">Geselecteerde tekst:</h4>
                <p className="text-green-800 font-medium">"{selectedText}"</p>
              </div>
              <Button
                onClick={addClaim}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                Toevoegen als Claim
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Identified Claims List */}
      <Card>
        <CardHeader>
          <CardTitle>Geïdentificeerde Claims ({geïdentificeerdeClaims.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {geïdentificeerdeClaims.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Nog geen claims geïdentificeerd. Selecteer tekst hierboven.
            </div>
          ) : (
            <div className="space-y-3">
              {geïdentificeerdeClaims.map((claim, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-yellow-100">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">"{claim}"</span>
                  </div>
                  <Button
                    onClick={() => removeClaim(claim)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    Verwijderen
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Suggestion (placeholder) */}
      {aiSuggestie && geïdentificeerdeClaims.length === 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm">🤖</span>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">AI Suggestie:</h4>
                <p className="text-sm text-blue-800">
                  Ik zie mogelijke claims als "Ik ben..." of "Ik hou van...". Selecteer deze om te beginnen!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation */}
      {!isValid && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900">Claims nodig</h4>
                <p className="text-sm text-yellow-800">
                  Identificeer minstens één claim in je bio voordat je doorgaat.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full bg-[#ff66c4] hover:bg-[#e55bb0] text-white"
            size="lg"
          >
            Claims Opslaan & Doorgaan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}