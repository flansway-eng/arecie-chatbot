'use client';

import { useState, useRef, FormEvent } from 'react';
import { ChatWindow } from '@/components/ChatWindow';
import { ChatInput } from '@/components/ChatInput';
import { Header } from '@/components/Header';
import { resolveNearbyPrestataires } from '@/lib/geolocationClient';
import { shouldTriggerGeolocation } from '@/lib/prestatairesSearch.shared';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };

    if (shouldTriggerGeolocation(text)) {
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);
      try {
        const { assistantContent } = await resolveNearbyPrestataires(text);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: assistantContent },
        ]);
      } catch (error) {
        console.error('Geolocation flow error:', error);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              "Je n'ai pas pu localiser les prestataires proches. Indiquez votre commune (ex: Cocody, Yopougon…).",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error('Erreur réseau');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: errorMessage || 'Désolé, une erreur technique est survenue. Veuillez réessayer plus tard.'
        }
      ]);
    } finally {
      setIsLoading(false);
      if (window.innerWidth > 768) {
        inputRef.current?.focus();
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleLocalExchange = (userContent: string, assistantContent: string) => {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userContent },
      { role: 'assistant', content: assistantContent },
    ]);
  };

  const handleClearConversation = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-arecie-gray50">
      <Header onClearConversation={handleClearConversation} />

      <main className="flex flex-col flex-1 min-h-0 bg-arecie-white max-w-4xl w-full mx-auto border-x border-arecie-gray100 shadow-sm">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onQuickAction={sendMessage}
          onLocalExchange={handleLocalExchange}
        />

        <ChatInput
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          inputRef={inputRef}
        />
      </main>
    </div>
  );
}
