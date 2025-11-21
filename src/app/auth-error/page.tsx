"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthErrorPage() {
  const router = useRouter();

  const handleRetry = () => {
    // A simple page reload might be enough if it's a transient issue.
    // In a real app, you might clear some state before retrying.
    router.push('/');
    window.location.reload();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/50 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-3xl">Authenticatie Mislukt</CardTitle>
          <CardDescription>
            Er kon geen verbinding worden gemaakt. Dit kan een tijdelijk probleem zijn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg bg-destructive/20 p-3 text-center text-sm text-destructive-foreground/80">
            Authenticatie is mislukt. Probeer het opnieuw.
          </div>
          <Button onClick={handleRetry} className="w-full" size="lg" variant="destructive">
            Probeer Opnieuw
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
