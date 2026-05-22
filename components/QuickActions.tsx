import clsx from "clsx";
import {
  IconReceipt,
  IconCreditCardOff,
  IconAlertCircle,
  IconInfoCircle,
  IconRefresh,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";

interface QuickActionsProps {
  onSelectAction: (text: string) => void;
  disabled?: boolean;
}

const actions: {
  label: string;
  text: string;
  icon: TablerIcon;
}[] = [
  { label: "Remboursement", text: "je veux un remboursement", icon: IconReceipt },
  { label: "Carte bloquée", text: "ma carte ne passe pas", icon: IconCreditCardOff },
  { label: "Réclamation", text: "je veux faire une réclamation", icon: IconAlertCircle },
  { label: "Renseignement", text: "j'ai besoin d'un renseignement", icon: IconInfoCircle },
  { label: "Renouvellement", text: "comment renouveler mon contrat ?", icon: IconRefresh },
];

export function QuickActions({ onSelectAction, disabled }: QuickActionsProps) {
  return (
    <div className="shrink-0 border-t border-gray-100 bg-white px-4 pb-2 pt-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
        Questions fréquentes :
      </p>
      <div className="flex flex-wrap gap-2">
        {actions.map(({ label, text, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => onSelectAction(text)}
            disabled={disabled}
            aria-label={`Poser la question sur : ${label}`}
            className={clsx(
              "inline-flex items-center rounded-full border border-arecie-green/20 bg-arecie-greenLight px-4 py-2 text-sm font-medium text-arecie-green transition-all duration-200",
              "hover:border-arecie-green hover:bg-arecie-green hover:text-white",
              "active:scale-95",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arecie-green",
              disabled && "cursor-not-allowed opacity-50 active:scale-100"
            )}
          >
            <Icon size={16} className="mr-1.5 shrink-0" aria-hidden="true" stroke={1.75} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
