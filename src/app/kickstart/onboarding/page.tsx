"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/user-provider";
import { Logo } from "@/components/shared/logo";
import { KickstartIntakeChat } from "@/components/kickstart/KickstartIntakeChat";
import type { KickstartIntakeData } from "@/types/kickstart-onboarding.types";
import { Loader2 } from "lucide-react";

export default function KickstartOnboardingPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Security: Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/kickstart/onboarding");
    }
  }, [user, isLoading, router]);

  const handleIntakeComplete = async (data: KickstartIntakeData) => {
    if (!user?.id) {
      router.push("/login?redirect=/kickstart/onboarding");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      console.log("💾 Saving Kickstart onboarding data:", data);

      const response = await fetch("/api/kickstart/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save onboarding");
      }

      const result = await response.json();
      console.log("✅ Onboarding saved successfully:", result);

      // Redirect to Day 1
      router.push(result.nextUrl || "/kickstart/dag/1");

    } catch (err) {
      console.error("❌ Error saving onboarding:", err);
      setError(err instanceof Error ? err.message : "Failed to save onboarding");
      setIsSaving(false);
    }
  };

  // Show loading while checking auth or redirecting
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isLoading ? "Laden..." : "Je wordt doorgestuurd naar login..."}
          </h2>
        </div>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Je profiel wordt opgeslagen...
          </h2>
          <p className="text-gray-600">
            Iris bereidt Dag 1 voor jou voor 🎯
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo iconSize={36} textSize="lg" />
        </div>

        {/* Kickstart Badge */}
        <div className="text-center mb-4">
          <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
            🎯 Kickstart 21-Day Program
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-[calc(100vh-220px)] min-h-[500px]">
          <KickstartIntakeChat onComplete={handleIntakeComplete} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Footer Info */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Deze informatie helpt Iris om je de beste persoonlijke coaching te geven 🚀
        </p>
      </div>
    </div>
  );
}
