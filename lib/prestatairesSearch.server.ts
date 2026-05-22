import fs from "fs";
import path from "path";
import { communeMatches, type Prestataire } from "@/lib/prestataires";
import {
  extractCommuneFromText,
  filterByTypeHint,
  isPrestataireRelatedQuery,
  isProximityOnlyQuery,
  MAIN_COMMUNES,
  TYPE_LABEL_FR,
} from "@/lib/prestatairesSearch.shared";

const MAX_CONTEXT_ITEMS = 40;

let prestatairesCache: Prestataire[] | null = null;
let communesIndexCache: string[] | null = null;

function loadPrestatairesServer(): Prestataire[] {
  if (prestatairesCache) return prestatairesCache;
  const filePath = path.join(process.cwd(), "public", "prestataires.json");
  prestatairesCache = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  ) as Prestataire[];
  return prestatairesCache;
}

function getCommunesIndex(): string[] {
  if (!communesIndexCache) {
    const fromData = loadPrestatairesServer()
      .map((p) => p.commune.trim())
      .filter((c) => c.length >= 3 && !c.startsWith("A RENSEIGNER"));
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const c of [...MAIN_COMMUNES, ...fromData]) {
      const key = c.toUpperCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(c);
      }
    }
    communesIndexCache = unique.sort((a, b) => b.length - a.length);
  }
  return communesIndexCache;
}

function formatPrestatairesContextBlock(
  commune: string,
  prestataires: Prestataire[]
): string {
  const limited = prestataires.slice(0, MAX_CONTEXT_ITEMS);
  const lines = limited.map(
    (p) => `- ${p.nom} (${TYPE_LABEL_FR[p.type]})`
  );

  if (prestataires.length > MAX_CONTEXT_ITEMS) {
    lines.push(
      `… (${prestataires.length - MAX_CONTEXT_ITEMS} autres établissements non listés)`
    );
  }

  return [
    `[PRESTATAIRES DISPONIBLES À ${commune}]`,
    ...lines,
    "[FIN LISTE]",
    "Consigne : cite uniquement les établissements de cette liste. N'invente aucun nom.",
  ].join("\n");
}

function formatProximityContextBlock(): string {
  return [
    "[RECHERCHE PRESTATAIRE À PROXIMITÉ — COMMUNE NON PRÉCISÉE]",
    "L'utilisateur demande un prestataire proche sans indiquer sa commune.",
    "Invite-le à utiliser le bouton « Prestataires près de moi » (géolocalisation) ou à préciser sa commune (Cocody, Yopougon, Plateau, Abobo, etc.).",
    "Ne cite aucun nom d'établissement tant qu'aucune commune n'est connue.",
    "[FIN LISTE]",
  ].join("\n");
}

export function buildPrestataireInjection(userMessage: string): string | null {
  const communesIndex = getCommunesIndex();

  if (!isPrestataireRelatedQuery(userMessage, communesIndex)) {
    return null;
  }

  if (isProximityOnlyQuery(userMessage, communesIndex)) {
    return formatProximityContextBlock();
  }

  const commune = extractCommuneFromText(userMessage, communesIndex);
  if (!commune) return null;

  let matched = loadPrestatairesServer().filter((p) =>
    communeMatches(p.commune, commune)
  );
  matched = filterByTypeHint(matched, userMessage);

  const communeLabel = commune.toUpperCase();

  if (matched.length === 0) {
    return [
      `[PRESTATAIRES DISPONIBLES À ${communeLabel}]`,
      "(Aucun prestataire trouvé dans la base pour cette commune.)",
      "[FIN LISTE]",
      "Orientez vers MediNova → Réseau de soins ou Karidja Doumbia : 07 08 88 05 05.",
    ].join("\n");
  }

  return formatPrestatairesContextBlock(communeLabel, matched);
}
