import { useEffect, useRef } from "react";
import { HeartPulse } from "lucide-react";
import { MessageBubble, TypingIndicator } from "./MessageBubble";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

function WelcomeScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
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

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      className="flex flex-1 flex-col gap-3 overflow-y-auto scroll-smooth bg-arecie-gray50 p-4"
      role="log"
      aria-live="polite"
    >
      {messages.length === 0 ? (
        <WelcomeScreen />
      ) : (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          {messages.map((msg, index) => (
            <MessageBubble key={index} role={msg.role} content={msg.content} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
