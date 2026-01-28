"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Home, MessageCircle, Heart } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-redirect when back online
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);

    try {
      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-store"
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch {
      // Still offline
    } finally {
      setIsRetrying(false);
    }
  };

  if (isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-50 via-white to-rose-50 flex items-center justify-center p-4">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <Heart className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Je bent weer online!
          </h1>
          <p className="text-gray-600">
            Even geduld, we brengen je terug...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-white to-rose-50 flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-center border-b border-coral-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral-500 to-rose-500 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-coral-600 to-rose-600 bg-clip-text text-transparent">
            DatingAssistent
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Offline Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center animate-pulse">
            <WifiOff className="w-16 h-16 text-gray-400" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
            <span className="text-2xl">😔</span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Geen internetverbinding
        </h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Het lijkt erop dat je offline bent. Controleer je internetverbinding
          en probeer het opnieuw.
        </p>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="group mb-8 px-8 py-4 bg-gradient-to-r from-coral-500 to-rose-500 text-white rounded-2xl font-semibold shadow-lg shadow-coral-500/25 hover:shadow-xl hover:shadow-coral-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
        >
          <RefreshCw className={`w-5 h-5 ${isRetrying ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
          {isRetrying ? "Verbinden..." : "Opnieuw proberen"}
        </button>

        {/* Offline Features */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full shadow-xl border border-coral-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <span className="text-lg">Wat je offline kunt doen:</span>
          </h2>
          <ul className="space-y-3 text-left">
            <li className="flex items-start gap-3 text-gray-600">
              <span className="w-6 h-6 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm">1</span>
              </span>
              <span>Eerder geladen pagina&apos;s bekijken uit de cache</span>
            </li>
            <li className="flex items-start gap-3 text-gray-600">
              <span className="w-6 h-6 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm">2</span>
              </span>
              <span>Je berichten worden automatisch verstuurd zodra je weer online bent</span>
            </li>
            <li className="flex items-start gap-3 text-gray-600">
              <span className="w-6 h-6 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm">3</span>
              </span>
              <span>Gebruik de app shortcuts voor snelle toegang</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Bottom Navigation (cached pages) */}
      <nav className="p-4 border-t border-coral-100 bg-white/50 backdrop-blur-sm">
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-coral-50 transition-colors"
          >
            <Home className="w-6 h-6 text-gray-500" />
            <span className="text-xs text-gray-500">Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-coral-50 transition-colors"
          >
            <Heart className="w-6 h-6 text-gray-500" />
            <span className="text-xs text-gray-500">Dashboard</span>
          </Link>
          <Link
            href="/chat"
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-coral-50 transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-gray-500" />
            <span className="text-xs text-gray-500">Chat</span>
          </Link>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Gecachte pagina&apos;s kunnen beschikbaar zijn
        </p>
      </nav>
    </div>
  );
}
