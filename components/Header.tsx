import { Logo } from "./Logo";

export function Header() {
  return (
    <header
      className="h-16 w-full shrink-0 z-20 bg-gradient-to-r from-arecie-green to-arecie-greenDark shadow-header-green"
      role="banner"
    >
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-arecie-white px-1.5 shadow-sm">
            <Logo size="sm" priority />
          </div>
          <div className="min-w-0">
            <h1 className="opacity-0 animate-fade-slide-up-delay-header text-lg font-semibold text-arecie-white truncate">
              ARECIE Assistant
            </h1>
            <p className="text-xs text-white/70 truncate">
              Toujours à vos côtés
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-arecie-yellow animate-pulse-soft"
              aria-hidden="true"
            />
            <span className="text-xs text-white/80 whitespace-nowrap">
              En ligne
            </span>
          </div>
          <div
            className="hidden sm:block h-4 w-px bg-white/30"
            aria-hidden="true"
          />
          <span className="hidden sm:block text-xs text-white/50 whitespace-nowrap">
            arecie-asmar.com
          </span>
        </div>
      </div>
    </header>
  );
}
