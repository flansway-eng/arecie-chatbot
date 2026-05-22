export interface Prestataire {
  nom: string;
  type: "CENTRE DE SOINS" | "PHARMACIE" | "LABORATOIRE" | "OPTIQUE";
  commune: string;
}

const TYPE_DISPLAY: Record<
  Prestataire["type"],
  { emoji: string; label: string }
> = {
  "CENTRE DE SOINS": { emoji: "🏥", label: "Centre de soins" },
  PHARMACIE: { emoji: "💊", label: "Pharmacie" },
  LABORATOIRE: { emoji: "🔬", label: "Laboratoire" },
  OPTIQUE: { emoji: "👓", label: "Optique" },
};

const TYPE_ORDER: Prestataire["type"][] = [
  "CENTRE DE SOINS",
  "PHARMACIE",
  "LABORATOIRE",
  "OPTIQUE",
];

const MAX_PER_TYPE = 8;
const MAX_TOTAL = 24;

export function normalizeCommune(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Correspondance partielle insensible à la casse (ex. Cocody ↔ COCODY, II PLATEAUX) */
export function communeMatches(
  prestataireCommune: string,
  detectedCommune: string
): boolean {
  const p = normalizeCommune(prestataireCommune);
  const d = normalizeCommune(detectedCommune);
  if (!p || !d) return false;
  if (p === d) return true;
  if (p.includes(d) || d.includes(p)) return true;
  const pWords = p.split(" ");
  const dWords = d.split(" ");
  return pWords.some((w) => w.length >= 4 && d.includes(w)) ||
    dWords.some((w) => w.length >= 4 && p.includes(w));
}

const CORRUPT_COMMUNE_MARKERS = [
  "PHARMACIE",
  "LABORATOIRE",
  "OPTIQUE",
  "CENTRE DE",
  "/",
] as const;

/** Communes du JSON sans libellés fusionnés (ex. BINGERVILLEPHARMACIE MATHE) */
export function isCleanCommuneName(commune: string): boolean {
  const n = normalizeCommune(commune);
  if (n.length < 4 || n.length > 32) return false;
  return !CORRUPT_COMMUNE_MARKERS.some((m) => n.includes(m));
}

/** Priorité du champ Nominatim (ville > village > quartier) */
const NOMINATIM_FIELD_PRIORITY: { key: string; priority: number }[] = [
  { key: "quarter", priority: 30 },
  { key: "suburb", priority: 70 },
  { key: "city_district", priority: 60 },
  { key: "neighbourhood", priority: 20 },
  { key: "town", priority: 90 },
  { key: "village", priority: 80 },
  { key: "city", priority: 100 },
  { key: "county", priority: 50 },
  { key: "state_district", priority: 40 },
];

function matchCandidateToCommune(
  candidate: string,
  communes: string[]
): string | null {
  const c = normalizeCommune(candidate);
  if (c.length < 4) return null;

  const clean = communes.filter(isCleanCommuneName);

  const exact = clean.find((com) => normalizeCommune(com) === c);
  if (exact) return exact;

  const partial = clean.filter((com) => {
    const cn = normalizeCommune(com);
    return cn.includes(c) || c.includes(cn);
  });
  if (!partial.length) return null;

  return partial.sort((a, b) => a.length - b.length)[0];
}

/**
 * Résout la commune ARECIE à partir de l'adresse Nominatim en testant tous
 * les champs, puis en retenant la correspondance la plus fiable (ville en priorité).
 */
export function resolveCommuneFromNominatim(
  address: Record<string, string | undefined>,
  prestataires: Prestataire[]
): string | null {
  const communes = Array.from(
    new Set(prestataires.map((p) => p.commune))
  );

  const candidates = [
    address.quarter,
    address.suburb,
    address.city_district,
    address.neighbourhood,
    address.town,
    address.village,
    address.city,
    address.county,
    address.state_district,
  ].filter((v): v is string => Boolean(v?.trim()));

  let best: { commune: string; priority: number } | null = null;

  for (const { key, priority } of NOMINATIM_FIELD_PRIORITY) {
    const raw = address[key];
    if (!raw?.trim()) continue;
    const match = matchCandidateToCommune(raw.trim(), communes);
    if (match && (!best || priority > best.priority)) {
      best = { commune: match, priority };
    }
  }

  if (!best) {
    console.log("Adresse Nominatim complète:", address);
    console.log("Candidats testés:", candidates);
  }

  return best?.commune ?? null;
}

export function findPrestatairesForResolvedCommune(
  prestataires: Prestataire[],
  resolvedCommune: string
): Prestataire[] {
  const target = normalizeCommune(resolvedCommune);
  return prestataires.filter((p) => {
    const pNorm = normalizeCommune(p.commune);
    if (pNorm === target) return true;
    return isCleanCommuneName(p.commune) && communeMatches(p.commune, resolvedCommune);
  });
}

export function findPrestatairesByCommune(
  prestataires: Prestataire[],
  detectedCommunes: string[]
): { matched: Prestataire[]; communeLabel: string } {
  const normalizedDetected = detectedCommunes.map(normalizeCommune);

  for (const raw of detectedCommunes) {
    const matched = prestataires.filter((p) =>
      communeMatches(p.commune, raw)
    );
    if (matched.length > 0) {
      return { matched, communeLabel: raw.toUpperCase() };
    }
  }

  for (const detected of normalizedDetected) {
    const matched = prestataires.filter((p) =>
      communeMatches(p.commune, detected)
    );
    if (matched.length > 0) {
      return {
        matched,
        communeLabel: detectedCommunes[0]?.toUpperCase() ?? detected,
      };
    }
  }

  return {
    matched: [],
    communeLabel: detectedCommunes[0]?.toUpperCase() ?? "votre zone",
  };
}

export function formatPrestatairesMessage(
  communeLabel: string,
  prestataires: Prestataire[]
): string {
  const byType = new Map<Prestataire["type"], Prestataire[]>();
  for (const p of prestataires) {
    const list = byType.get(p.type) ?? [];
    if (list.length < MAX_PER_TYPE) {
      list.push(p);
      byType.set(p.type, list);
    }
  }

  const lines: string[] = [
    `📍 Prestataires ASMAR près de vous (${communeLabel}) :`,
    "",
  ];

  let total = 0;
  for (const type of TYPE_ORDER) {
    const list = byType.get(type);
    if (!list?.length) continue;
    for (const p of list) {
      if (total >= MAX_TOTAL) break;
      const { emoji, label } = TYPE_DISPLAY[p.type];
      lines.push(`${emoji} ${p.nom} — ${label}`);
      total++;
    }
  }

  if (prestataires.length > total) {
    lines.push("");
    lines.push(
      `… et ${prestataires.length - total} autre(s) établissement(s) dans cette zone.`
    );
  }

  lines.push("");
  lines.push("✅ Ces établissements sont agréés WTW.");
  lines.push("Présentez votre carte ASMAR à la réception.");

  return lines.join("\n");
}

export function formatNoPrestatairesMessage(communeLabel: string): string {
  return [
    `Aucun prestataire trouvé à ${communeLabel}.`,
    "Consultez la liste complète via MediNova → Réseau de soins",
    "ou contactez : 07 08 88 05 05 (Karidja Doumbia — WTW)",
  ].join("\n");
}

export const GEO_DENIED_MESSAGE =
  "Pour trouver un prestataire, dites-moi votre commune (ex: Cocody, Yopougon, Plateau…)";

export const GEO_ERROR_MESSAGE =
  "Je n'ai pas pu déterminer votre position. Indiquez votre commune (ex: Cocody, Yopougon…) ou réessayez.";
