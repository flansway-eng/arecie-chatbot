import { FormEvent, RefObject } from "react";
import { IconSend2 } from "@tabler/icons-react";
import clsx from "clsx";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  inputRef: RefObject<HTMLInputElement>;
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  inputRef,
}: ChatInputProps) {
  const canSend = !isLoading && input.trim().length > 0;

  return (
    <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3">
      <form onSubmit={onSubmit}>
        <div
          className={clsx(
            "flex items-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 transition-all duration-200",
            "focus-within:border-arecie-green focus-within:ring-2 focus-within:ring-arecie-green/20"
          )}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Écrivez votre message ici..."
            disabled={isLoading}
            className="min-h-[48px] flex-1 bg-transparent px-4 py-3 text-base text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Votre message"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="m-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-arecie-green transition-colors duration-200 hover:bg-arecie-greenDark disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Envoyer le message"
          >
            <IconSend2 size={20} className="text-white" aria-hidden="true" stroke={1.75} />
          </button>
        </div>
      </form>
      <p className="py-1 text-center text-xs text-gray-400">
        L&apos;Assistant ARECIE est là pour vous guider · Urgence médicale (SAMU) : appelez le 185 ou +225 27 22 44 53 53 / +225 27 22 44 94 09
      </p>
    </div>
  );
}
