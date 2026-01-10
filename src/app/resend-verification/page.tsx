"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AuthLayout from "../auth-layout";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Fout",
        description: "Vul je emailadres in",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
        toast({
          title: "Email verzonden!",
          description: "Check je inbox voor de nieuwe verificatiecode.",
        });
      } else {
        toast({
          title: "Fout",
          description: data.error || "Kon verificatie email niet verzenden",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er ging iets mis. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>Email Verzonden!</CardTitle>
            <CardDescription>
              We hebben een nieuwe verificatiecode gestuurd naar <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
              <p className="font-semibold mb-2 dark:text-blue-200">Volgende stappen:</p>
              <ol className="list-decimal list-inside space-y-1 dark:text-blue-100">
                <li>Check je inbox (en spam folder!)</li>
                <li>Kopieer de 6-cijferige code</li>
                <li>Ga naar de verificatie pagina</li>
                <li>Voer de code in</li>
              </ol>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm">
              <p className="font-semibold mb-1 dark:text-yellow-200">Tip: Email in spam?</p>
              <p className="dark:text-yellow-100">Voeg <strong>noreply@datingassistent.nl</strong> toe aan je contacten om toekomstige emails te ontvangen.</p>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Link href="/login" className="w-full">
              <Button className="w-full" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug naar inloggen
              </Button>
            </Link>
            <Button
              onClick={() => setSent(false)}
              variant="ghost"
              className="w-full"
            >
              Nog een keer verzenden
            </Button>
          </CardFooter>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Mail className="h-16 w-16 text-blue-500" />
          </div>
          <CardTitle>Email Verificatie</CardTitle>
          <CardDescription>
            Geen verificatie email ontvangen? Geen probleem! We sturen je een nieuwe.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResend}>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Emailadres
              </label>
              <Input
                type="email"
                placeholder="jouw@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm">
              <p className="font-semibold mb-2 dark:text-yellow-200">Let op:</p>
              <ul className="list-disc list-inside space-y-1 dark:text-yellow-100">
                <li>Check je <strong>spam/junk folder</strong></li>
                <li>De code is <strong>1 uur geldig</strong></li>
                <li>Voeg ons toe aan je contacten</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <LoadingSpinner className="mr-2" />}
              Verstuur Nieuwe Verificatiecode
            </Button>
            <Link href="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug naar inloggen
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
}
