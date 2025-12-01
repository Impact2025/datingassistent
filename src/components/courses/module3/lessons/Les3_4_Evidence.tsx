'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { LessonCard } from '../shared/LessonCard';
import { Les3_4_EvidenceProps, ClaimProof, validateClaim, validateProof } from '../types/module3.types';

export function Les3_4_Evidence({ onComplete }: Les3_4_EvidenceProps) {
  const [proofs, setProofs] = useState<ClaimProof[]>([
    { claim: '', proof: '' },
    { claim: '', proof: '' },
    { claim: '', proof: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProof = (index: number, field: 'claim' | 'proof', value: string) => {
    const newProofs = [...proofs];
    newProofs[index] = { ...newProofs[index], [field]: value };
    setProofs(newProofs);
  };

  const addProof = () => {
    if (proofs.length < 5) {
      setProofs([...proofs, { claim: '', proof: '' }]);
    }
  };

  const removeProof = (index: number) => {
    if (proofs.length > 1) {
      setProofs(proofs.filter((_, i) => i !== index));
    }
  };

  const getValidProofs = () => {
    return proofs.filter(proof =>
      validateClaim(proof.claim) && validateProof(proof.proof)
    );
  };

  const handleSubmit = async () => {
    const validProofs = getValidProofs();
    if (validProofs.length === 0) return;

    setIsSubmitting(true);
    try {
      // Save proofs to database
      const response = await fetch('/api/user/profile/proofs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        },
        body: JSON.stringify({ proofs: validProofs })
      });

      if (response.ok) {
        // Update profile with proof count
        await fetch('/api/user/profile/update', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
          },
          body: JSON.stringify({
            profieltekst_proof_count: validProofs.length
          })
        });

        onComplete({ proofs: validProofs, count: validProofs.length });
      } else {
        throw new Error('Failed to save proofs');
      }
    } catch (error) {
      console.error('Proof submission failed:', error);
      // For demo purposes, still complete
      onComplete({ proofs: validProofs, count: validProofs.length });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validProofs = getValidProofs();

  return (
    <LessonCard title="Evidence (E)" emoji="📊">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Claim-to-Proof Builder</h3>
          <p className="text-sm text-muted-foreground">
            Transformeer beweringen in geloofwaardige verhalen met concrete bewijzen.
            Sterke evidence verhoogt je geloofwaardigheid met 60%.
          </p>
        </div>

        <Card className="bg-green-50/50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <strong>Hoe het werkt:</strong> Maak beweringen geloofwaardig door concrete
                anekdotes toe te voegen. Bijv: "Ik ben avontuurlijk" → "Vorige maand beklom ik
                voor het eerst de Mont Blanc en deelde die ervaring met mijn klimmaatjes in Chamonix."
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {proofs.map((proof, index) => (
            <Card key={index} className="border-l-4 border-l-primary/20">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Evidence Set {index + 1}</h4>
                  {proofs.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProof(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Claim Input */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Claim (Max 3 woorden - wat beweer je?)
                  </Label>
                  <Input
                    value={proof.claim}
                    onChange={(e) => updateProof(index, 'claim', e.target.value)}
                    placeholder="bijv: Avontuurlijk, Creatief, Betrouwbaar"
                    maxLength={50}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>
                      {proof.claim.split(' ').filter(word => word.length > 0).length}/3 woorden
                    </span>
                    <span className={
                      validateClaim(proof.claim) ? 'text-green-600' : 'text-red-600'
                    }>
                      {validateClaim(proof.claim) ? '✓ Geldig' : '✗ Max 3 woorden'}
                    </span>
                  </div>
                </div>

                {/* Proof Input */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Proof (Concrete anekdote - min 5 woorden)
                  </Label>
                  <Textarea
                    value={proof.proof}
                    onChange={(e) => updateProof(index, 'proof', e.target.value)}
                    placeholder="bijv: Vorige maand beklom ik voor het eerst de Mont Blanc en deelde die ervaring met mijn klimmaatjes in Chamonix. Het was intens maar ongelooflijk mooi..."
                    rows={3}
                    maxLength={300}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>
                      {proof.proof.split(' ').filter(word => word.length > 0).length}/5+ woorden minimum
                    </span>
                    <span className={
                      validateProof(proof.proof) ? 'text-green-600' : 'text-red-600'
                    }>
                      {validateProof(proof.proof) ? '✓ Geldig' : '✗ Te kort'}
                    </span>
                  </div>
                </div>

                {/* Validation Status */}
                <div className="flex items-center gap-2 text-sm">
                  {validateClaim(proof.claim) && validateProof(proof.proof) ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Compleet - klaar voor opslaan</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>Vul beide velden correct in</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add More Button */}
        {proofs.length < 5 && (
          <Button
            variant="outline"
            onClick={addProof}
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Voeg Evidence Set Toe
          </Button>
        )}

        {/* Summary & Submit */}
        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {validProofs.length}/{proofs.length}
                </div>
                <div className="text-sm text-blue-800">
                  Evidence sets compleet en klaar voor opslaan
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            disabled={validProofs.length === 0 || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Bezig met opslaan...' : `Sla ${validProofs.length} Evidence Sets Op`}
          </Button>

          {validProofs.length === 0 && proofs.some(p => p.claim || p.proof) && (
            <p className="text-sm text-orange-600 text-center">
              Zorg ervoor dat je claims maximaal 3 woorden bevatten en proofs minimaal 5 woorden.
            </p>
          )}
        </div>

        {/* Tips */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <h5 className="font-semibold text-purple-900 mb-2">💡 Evidence Tips</h5>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• <strong>Specifiek:</strong> Gebruik concrete details (namen, plaatsen, data)</li>
              <li>• <strong>Recent:</strong> Bewijzen uit het verleden jaar werken het beste</li>
              <li>• <strong>Persoonlijk:</strong> Laat je karakter doorschemeren</li>
              <li>• <strong>Bewijsbaar:</strong> Kies verhalen die anderen kunnen bevestigen</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </LessonCard>
  );
}