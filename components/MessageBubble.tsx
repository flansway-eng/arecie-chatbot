/* eslint-disable @typescript-eslint/no-unused-vars */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import { User } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

function BotAvatar() {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-arecie-greenLight"
      aria-hidden="true"
    >
      <span className="text-sm font-bold text-arecie-green">A</span>
    </div>
  );
}

function UserAvatar() {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200"
      aria-hidden="true"
    >
      <User size={18} className="text-gray-500" strokeWidth={2} />
    </div>
  );
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="flex max-w-[75%] items-end gap-2">
          <div className="rounded-[18px_18px_4px_18px] bg-arecie-green px-4 py-2.5 text-base leading-relaxed text-white shadow-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node: _node, ...props }) => (
                  <a
                    {...props}
                    className="font-medium text-white underline hover:text-white/90"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                ul: ({ node: _node, ...props }) => (
                  <ul {...props} className="my-2 list-disc space-y-1 pl-5" />
                ),
                ol: ({ node: _node, ...props }) => (
                  <ol {...props} className="my-2 list-decimal space-y-1 pl-5" />
                ),
                p: ({ node: _node, ...props }) => (
                  <p {...props} className="mb-2 last:mb-0" />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
          <UserAvatar />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start">
      <div className="flex max-w-[80%] items-end gap-2">
        <BotAvatar />
        <div className="rounded-[18px_18px_18px_4px] border border-gray-100 bg-white px-4 py-3 text-base leading-[1.6] text-gray-800 shadow-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node: _node, ...props }) => (
                <a
                  {...props}
                  className="font-medium text-arecie-green underline hover:text-arecie-greenDark"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
              ul: ({ node: _node, ...props }) => (
                <ul {...props} className="my-2 list-disc space-y-1 pl-5" />
              ),
              ol: ({ node: _node, ...props }) => (
                <ol {...props} className="my-2 list-decimal space-y-1 pl-5" />
              ),
              p: ({ node: _node, ...props }) => (
                <p {...props} className="mb-2 last:mb-0" />
              ),
              h1: ({ node: _node, ...props }) => (
                <h1 {...props} className="mb-2 text-xl font-bold" />
              ),
              h2: ({ node: _node, ...props }) => (
                <h2 {...props} className="mb-2 text-lg font-bold" />
              ),
              h3: ({ node: _node, ...props }) => (
                <h3 {...props} className="mb-2 text-base font-bold" />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start" aria-live="polite" aria-busy="true">
      <div className="flex max-w-[80%] items-end gap-2">
        <BotAvatar />
        <div className="flex items-center gap-1.5 rounded-[18px_18px_18px_4px] border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <span
            className="h-2 w-2 rounded-full bg-gray-400 animate-pulse-soft"
            style={{ animationDelay: "0s" }}
            aria-hidden="true"
          />
          <span
            className="h-2 w-2 rounded-full bg-gray-400 animate-pulse-soft"
            style={{ animationDelay: "0.2s" }}
            aria-hidden="true"
          />
          <span
            className="h-2 w-2 rounded-full bg-gray-400 animate-pulse-soft"
            style={{ animationDelay: "0.4s" }}
            aria-hidden="true"
          />
          <span className="sr-only">L&apos;assistant est en train d&apos;écrire…</span>
        </div>
      </div>
    </div>
  );
}
