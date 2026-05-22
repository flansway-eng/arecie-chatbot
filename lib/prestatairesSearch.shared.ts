import { communeMatches, normalizeCommune, type Prestataire } from "@/lib/prestataires";

export const PRESTATAIRE_KEYWORDS = [
  "prestataire",
  "prestataires",
  "pharmacie",
  "pharmacies",
  "clinique",
  "cliniques",
  "laboratoire",
  "laboratoires",
  "opticien",
  "optique",
  "optiques",
  "près de moi",
  "pres de moi",
  "proche",
  "proches",
  "à proximité",
  "a proximite",
  "réseau de soins",
  "reseau de soins",
  "conventionné",
  "conventionne",
];

export const MAIN_COMMUNES = [
  "II PLATEAUX ANGRE",
  "II PLATEAUX VALLON",
  "II PLATEAUX 7E TRANCHE",
  "II PLATEAUX DOKUI",
  "II PLATEAUX",
  "PORT-BOUËT",
  "PORT-BOUET",
  "GRAND-BASSAM",
  "SAN-PEDRO",
  "YAMOUSSOUKRO",
  "TREICHVILLE",
  "BINGERVILLE",
  "YOPOUGON",
  "KOUMASSI",
  "RIVIERA",
  "MARCORY",
  "PLATEAU",
  "COCODY",
  "ADJAME",
  "ABOBO",
  "BOUAKÉ",
  "BOUAKE",
  "DALOA",
  "GAGNOA",
  "KORHOGO",
  "MAN",
  "DIVO",
  "ABENGOUROU",
  "BONDOUKOU",
  "AGBOVILLE",
  "ANYAMA",
  "ANGRE",
  "ABIDJAN",
];

export const TYPE_LABEL_FR: Record<Prestataire["type"], string> = {
  "CENTRE DE SOINS": "Centre de soins",
  PHARMACIE: "Pharmacie",
  LABORATOIRE: "Laboratoire",
  OPTIQUE: "Optique",
};

export function normalizeForSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function extractCommuneFromText(
  text: string,
  communesIndex: string[]
): string | null {
  const normalizedMessage = normalizeCommune(text);

  for (const commune of communesIndex) {
    const nc = normalizeCommune(commune);
    if (nc.length < 4) continue;
    if (normalizedMessage.includes(nc)) {
      return commune;
    }
  }

  const prepositionMatch = text.match(
    /\b(?:à|a|en|sur|dans|commune\s+(?:de|d')?)\s+([A-Za-zÀ-ÿ0-9\s\-']{3,40})/i
  );
  if (prepositionMatch?.[1]) {
    const candidate = prepositionMatch[1].trim();
    for (const commune of communesIndex) {
      if (communeMatches(commune, candidate)) return commune;
    }
    return candidate.toUpperCase();
  }

  return null;
}

export function isPrestataireRelatedQuery(
  text: string,
  communesIndex: string[]
): boolean {
  const normalized = normalizeForSearch(text);
  if (
    PRESTATAIRE_KEYWORDS.some((kw) =>
      normalized.includes(normalizeForSearch(kw))
    )
  ) {
    return true;
  }
  return extractCommuneFromText(text, communesIndex) !== null;
}

export function isProximityOnlyQuery(
  text: string,
  communesIndex: string[]
): boolean {
  const normalized = normalizeForSearch(text);
  const hasProximity =
    /\b(proche|proches|pres de moi|près de moi|a proximite|à proximité|autour de moi)\b/.test(
      normalized
    );
  const hasProvider =
    /\b(prestataire|pharmacie|clinique|laboratoire|opticien|optique)\b/.test(
      normalized
    );
  return (
    hasProximity &&
    (hasProvider || isPrestataireRelatedQuery(text, communesIndex))
  );
}

export function filterByTypeHint(
  prestataires: Prestataire[],
  text: string
): Prestataire[] {
  const n = normalizeForSearch(text);
  if (/\bpharmacie/.test(n)) {
    return prestataires.filter((p) => p.type === "PHARMACIE");
  }
  if (/\b(opticien|optique)/.test(n)) {
    return prestataires.filter((p) => p.type === "OPTIQUE");
  }
  if (/\blaboratoire/.test(n)) {
    return prestataires.filter((p) => p.type === "LABORATOIRE");
  }
  if (/\b(clinique|centre de soins|cabinet)/.test(n)) {
    return prestataires.filter((p) => p.type === "CENTRE DE SOINS");
  }
  return prestataires;
}

export function shouldTriggerGeolocation(text: string): boolean {
  return isProximityOnlyQuery(text, MAIN_COMMUNES);
}
