"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Share2, MessageCircle, Image, Link as LinkIcon, Loader2 } from "lucide-react";

function ShareTargetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);

  const title = searchParams.get("title") || "";
  const text = searchParams.get("text") || "";
  const url = searchParams.get("url") || "";

  useEffect(() => {
    // Combine shared content
    const sharedContent = [title, text, url].filter(Boolean).join("\n\n");

    if (sharedContent) {
      // Store in sessionStorage for the chat to pick up
      sessionStorage.setItem("shared-content", JSON.stringify({
        title,
        text,
        url,
        combined: sharedContent,
        timestamp: Date.now(),
      }));

      // Redirect to chat with the shared content
      setTimeout(() => {
        router.push(`/chat?shared=true`);
      }, 1500);
    } else {
      // No content shared, redirect to home
      router.push("/");
    }

    setIsProcessing(false);
  }, [title, text, url, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Header */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
          <Share2 className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Content ontvangen
        </h1>
        <p className="text-gray-600 mb-6">
          Je gedeelde content wordt verwerkt...
        </p>

        {/* Shared Content Preview */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-3">
          {title && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-pink-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Titel</p>
                <p className="text-sm text-gray-700 truncate">{title}</p>
              </div>
            </div>
          )}

          {text && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                <Image className="w-4 h-4 text-pink-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Tekst</p>
                <p className="text-sm text-gray-700 line-clamp-3">{text}</p>
              </div>
            </div>
          )}

          {url && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-4 h-4 text-pink-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Link</p>
                <p className="text-sm text-pink-600 truncate">{url}</p>
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Even geduld...</span>
          </div>
        )}

        {!isProcessing && (
          <p className="text-sm text-gray-500">
            Je wordt doorgestuurd naar de chat...
          </p>
        )}
      </div>
    </div>
  );
}

export default function ShareTargetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      }
    >
      <ShareTargetContent />
    </Suspense>
  );
}
