"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AuthLayout from "../auth-layout";

function MagicLoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const next = searchParams.get("next") || "/dashboard";

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Ongeldige link.");
      return;
    }

    fetch("/api/auth/magic-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, next }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          router.push(next);
        } else {
          setError(data.error || "Deze inloglink is ongeldig of verlopen.");
        }
      })
      .catch(() => {
        setError("Er is iets misgegaan. Probeer het opnieuw.");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Inloggen…</CardTitle>
        <CardDescription>
          Je wordt automatisch ingelogd op DatingAssistent.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error ? (
          <>
            <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 text-center">
              {error}
            </p>
            <Button onClick={() => router.push("/login")} size="lg" className="w-full">
              Nieuwe inloglink aanvragen
            </Button>
          </>
        ) : (
          <p className="text-sm text-center text-gray-500">Even geduld…</p>
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
