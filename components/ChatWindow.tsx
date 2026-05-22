"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HeartPulse } from "lucide-react";
import clsx from "clsx";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { QuickActions } from "./QuickActions";
import { resolveNearbyPrestataires } from "@/lib/geolocationClient";
import { GEO_DENIED_MESSAGE } from "@/lib/prestataires";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onQuickAction: (text: string) => void;
  onLocalExchange: (userContent: string, assistantContent: string) => void;
}

function WelcomeScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 pb-4 text-center">
      <div className="opacity-0 animate-fade-slide-up-delay-1 flex flex-col items-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-arecie-greenLight"
          aria-hidden="true"
        >
          <HeartPulse size={28} className="text-arecie-green" strokeWidth={1.75} />
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-gray-900">Bonjour 👋</h2>
        <p className="mt-2 max-w-xs text-base text-gray-600">
          Je suis l&apos;Assistant ARECIE. Comment puis-je vous aider ?
        </p>
      </div>
    </div>
  );
}

export function ChatWindow({
  messages,
  isLoading,
  onQuickAction,
  onLocalExchange,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, geoLoading]);

  const handleNearbyProviders = useCallback(async () => {
    if (geoLoading || isLoading) return;

    const userLabel = "📍 Prestataires près de moi";

    if (!navigator.geolocation) {
      onLocalExchange(userLabel, GEO_DENIED_MESSAGE);
      return;
    }

    setGeoLoading(true);
    try {
      const { assistantContent } = await resolveNearbyPrestataires(userLabel);
      onLocalExchange(userLabel, assistantContent);
    } finally {
      setGeoLoading(false);
    }
  }, [geoLoading, isLoading, onLocalExchange]);

  const showEmptyState = messages.length === 0;
  const busy = isLoading || geoLoading;

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div
        className="flex flex-1 flex-col gap-3 overflow-y-auto scroll-smooth bg-arecie-gray50 p-4"
        role="log"
        aria-live="polite"
      >
        {showEmptyState ? (
          <WelcomeScreen />
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
            {messages.map((msg, index) => (
              <MessageBubble key={index} role={msg.role} content={msg.content} />
            ))}
            {(isLoading || geoLoading) && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {showEmptyState && (
        <>
          <QuickActions onSelectAction={onQuickAction} disabled={busy} />
          <div className="shrink-0 border-t border-gray-100 bg-white px-4 pb-2">
            <button
              type="button"
              onClick={handleNearbyProviders}
              disabled={busy}
              aria-label="Trouver les prestataires ASMAR près de ma position"
              className={clsx(
                "flex w-full items-center justify-center gap-2 rounded-full border border-arecie-green/20 bg-arecie-greenLight px-4 py-2.5 text-sm font-medium text-arecie-green transition-all duration-200",
                "hover:border-arecie-green hover:bg-arecie-green hover:text-white",
                "active:scale-95",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arecie-green",
                busy && "cursor-not-allowed opacity-50 active:scale-100"
              )}
            >
              📍 Prestataires près de moi
            </button>
          </div>
        </>
      )}
    </div>
  );
}
