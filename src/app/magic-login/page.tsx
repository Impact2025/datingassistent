"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AuthLayout from "../auth-layout";

function MagicLoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const next = searchParams.get("next") || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!token) {
      setError("Ongeldige link. Vraag een nieuwe inloglink aan.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/magic-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, next }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push(next);
      } else {
        setError(data.error || "Deze inloglink is ongeldig of verlopen.");
        setLoading(false);
      }
    } catch {
      setError("Er is iets misgegaan. Probeer het opnieuw.");
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Inloggen bevestigen</CardTitle>
        <CardDescription>
          Klik op de knop hieronder om in te loggen op DatingAssistent.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 text-center">
            {error}
          </p>
        )}
        {!token ? (
          <p className="text-sm text-center text-gray-500">
            Ongeldige inloglink. Vraag via de loginpagina een nieuwe aan.
          </p>
        ) : (
          <Button
            onClick={handleLogin}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? "Bezig met inloggen…" : "Log in met deze link"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function MagicLoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="text-center text-gray-500">Laden…</div>}>
        <MagicLoginContent />
      </Suspense>
    </AuthLayout>
  );
}
