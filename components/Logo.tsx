import Image from "next/image";
import clsx from "clsx";

const LOGO_PATH = "/images/logo-arecie.png";
const LOGO_WIDTH = 379;
const LOGO_HEIGHT = 181;

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeHeights: Record<LogoSize, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 80,
  xl: 120,
};

interface LogoProps {
  /** @deprecated Utiliser `size` */
  className?: string;
  size?: LogoSize;
  showSubtitle?: boolean;
  priority?: boolean;
}

export function Logo({
  className,
  size = "md",
  showSubtitle = false,
  priority = false,
}: LogoProps) {
  const height = sizeHeights[size];
  const width = Math.round((LOGO_WIDTH / LOGO_HEIGHT) * height);

  return (
    <div className={clsx("flex flex-col items-center", className)}>
      <Image
        src={LOGO_PATH}
        alt="ARECIE — Association des anciens et retraités de l'EECI et de la CIE"
        width={width}
        height={height}
        priority={priority}
        className="h-auto w-auto max-w-full object-contain"
        style={{ height, width: "auto", maxHeight: height }}
      />
      {showSubtitle && (
        <p className="mt-2 text-sm text-arecie-charcoal font-medium text-center uppercase tracking-tight max-w-md px-2">
          Association des anciens et retraités de l&apos;EECI et de la CIE
        </p>
      )}
    </div>
  );
}
