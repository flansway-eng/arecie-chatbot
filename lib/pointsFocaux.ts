export interface PointFocal {
  zoneOrVille: string;
  nom: string;
  secteurs?: string;
  contact: string;
}

export const INSTITUTIONAL_RECOMMENDATION_TEXT = `Les établissements proposés ci-dessus figurent parmi les PRESTATAIRES DE SANTÉ AGRÉÉS MU2S – Mutuelle Sociale Santé.

Pour vos consultations, examens, soins ou actes nécessitant une prise en charge, nous vous recommandons de contacter au préalable le point focal MU2S-ASMAR correspondant à votre zone afin d’obtenir votre bon de prise en charge MU2S.

Cette disposition pratique est à privilégier dans l’attente du règlement du différend actuellement en cours entre ASMAR et WTW.

Merci de vous rapprocher du point focal de votre zone avant de vous rendre chez le prestataire, afin de limiter les déplacements inutiles et de faciliter votre prise en charge.`.trim();

export const ABIDJAN_ZONES: Record<string, PointFocal> = {
  ZONE_1: {
    zoneOrVille: "Zone 1 (Abidjan)",
    nom: "Mme Konan Hortense",
    secteurs: "Riviera Attoban, Angré, Riviera 2, 7e et 8e tranches",
    contact: "01 01 56 60 06",
  },
  ZONE_2: {
    zoneOrVille: "Zone 2 (Abidjan)",
    nom: "Yao Gérard",
    secteurs: "Riviera Faya, Abatta, Akouédo, Djorogobité",
    contact: "07 09 60 12 69",
  },
  ZONE_3: {
    zoneOrVille: "Zone 3 (Abidjan)",
    nom: "Roger Flan",
    secteurs: "Bingerville, Feh Kessé",
    contact: "+225 07 57 86 98 21",
  },
  ZONE_4: {
    zoneOrVille: "Zone 4 (Abidjan)",
    nom: "Dabié Charles",
    secteurs: "grande partie d’Abidjan Sud",
    contact: "05 05 23 27 85",
  },
  ZONE_5: {
    zoneOrVille: "Zone 5 (Abidjan)",
    nom: "N’Da Kouamé",
    secteurs: "Yopougon",
    contact: "07 67 19 43 56",
  },
  ZONE_6: {
    zoneOrVille: "Zone 6 (Abidjan)",
    nom: "Abou Nestor",
    secteurs: "Songon, Km 17",
    contact: "07 07 60 61 62",
  },
};

export const REGIONAL_POINTS_FOCAUX: Record<string, PointFocal> = {
  DIMBOKRO: {
    zoneOrVille: "Dimbokro",
    nom: "DIBI COME",
    secteurs: "Dimbokro et environs",
    contact: "07 09 49 32 94 / 01 02 50 43 32",
  },
  GAGNOA: {
    zoneOrVille: "Gagnoa",
    nom: "APRI MARCEL",
    secteurs: "Gagnoa et région du Gôh",
    contact: "07 08 13 49 04 / 05 06 69 01 52",
  },
  YAMOUSSOUKRO: {
    zoneOrVille: "Yamoussoukro",
    nom: "Mme KOUAME MONIQUE",
    secteurs: "Yamoussoukro et région du Bélier",
    contact: "07 07 90 93 93 / 05 86 83 82 43",
  },
  SOUBRE: {
    zoneOrVille: "Soubré",
    nom: "SERI PREGNON",
    secteurs: "Soubré et région de la Nawa",
    contact: "07 58 30 64 40 / 01 02 50 64 57",
  },
  DALOA: {
    zoneOrVille: "Daloa",
    nom: "DIHE BLAISE",
    secteurs: "Daloa et région du Haut-Sassandra",
    contact: "07 08 03 48 06 / 05 04 24 13 84",
  },
  AGBOVILLE: {
    zoneOrVille: "Agboville",
    nom: "N'GBLA FRÉDÉRIC",
    secteurs: "Agboville et région de l'Agnéby-Tiassa",
    contact: "07 07 80 96 16 / 01 01 87 06 50",
  },
  MAN: {
    zoneOrVille: "Man",
    nom: "DIABATE LACINE",
    secteurs: "Man et région du Tonkpi",
    contact: "07 09 22 01 16",
  },
  KORHOGO: {
    zoneOrVille: "Korhogo",
    nom: "TRAORE BONAFOU",
    secteurs: "Korhogo et région du Poro",
    contact: "07 07 70 97 38",
  },
  BOUAKE: {
    zoneOrVille: "Bouaké",
    nom: "BAMBA NEMASSE",
    secteurs: "Bouaké et région de Gbêkê",
    contact: "07 09 75 69 97 / 01 02 50 70 62",
  },
};

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

export function resolvePointFocal(communeOrZone: string): PointFocal {
  const norm = normalizeText(communeOrZone);

  // 1. Détection villes de l'intérieur
  for (const [key, pf] of Object.entries(REGIONAL_POINTS_FOCAUX)) {
    if (norm.includes(key) || key.includes(norm)) {
      return pf;
    }
  }

  // 2. Détection par zones Abidjan
  // Zone 3: Bingerville, Feh Kessé
  if (norm.includes("BINGERVILLE") || norm.includes("FEH KESSE")) {
    return ABIDJAN_ZONES.ZONE_3;
  }

  // Zone 5: Yopougon
  if (norm.includes("YOPOUGON") || norm.includes("NIANGON") || norm.includes("SIPOREX") || norm.includes("MAROC") || norm.includes("SIDECI")) {
    return ABIDJAN_ZONES.ZONE_5;
  }

  // Zone 6: Songon, Km 17
  if (norm.includes("SONGON") || norm.includes("KM 17") || norm.includes("KM17") || norm.includes("DABOU")) {
    return ABIDJAN_ZONES.ZONE_6;
  }

  // Zone 2: Riviera Faya, Abatta, Akouédo, Djorogobité
  if (
    norm.includes("FAYA") ||
    norm.includes("ABATTA") ||
    norm.includes("AKOUEDO") ||
    norm.includes("DJOROGOBITE") ||
    norm.includes("PALMERAIE")
  ) {
    return ABIDJAN_ZONES.ZONE_2;
  }

  // Zone 1: Riviera Attoban, Angré, Riviera 2, 7e et 8e tranches, Cocody / Deux Plateaux
  if (
    norm.includes("ATTOBAN") ||
    norm.includes("ANGRE") ||
    norm.includes("RIVIERA 2") ||
    norm.includes("7E") ||
    norm.includes("8E") ||
    norm.includes("PLATEAUX") ||
    norm.includes("VALLON") ||
    norm.includes("DOKUI") ||
    norm.includes("COCODY")
  ) {
    return ABIDJAN_ZONES.ZONE_1;
  }

  // Zone 4: Abidjan Sud (Treichville, Marcory, Koumassi, Port-Bouët, Zone 3, Zone 4)
  if (
    norm.includes("TREICHVILLE") ||
    norm.includes("MARCORY") ||
    norm.includes("KOUMASSI") ||
    norm.includes("PORT-BOUET") ||
    norm.includes("PORT BOUET") ||
    norm.includes("ZONE 3") ||
    norm.includes("ZONE 4") ||
    norm.includes("BIETRY") ||
    norm.includes("ABIDJAN SUD")
  ) {
    return ABIDJAN_ZONES.ZONE_4;
  }

  // Autre quartier Abidjan (ex: Abobo, Adjamé, Plateau) -> Par défaut Zone 1 ou point focal central
  if (norm.includes("ABOBO") || norm.includes("ADJAME") || norm.includes("PLATEAU") || norm.includes("ABIDJAN")) {
    return ABIDJAN_ZONES.ZONE_1;
  }

  // Si non identifié, point focal par défaut
  return {
    zoneOrVille: communeOrZone || "Votre zone",
    nom: "Coordination des points focaux MU2S-ASMAR",
    secteurs: "Permanence et assistance pour le retrait des bons",
    contact: "07 57 86 98 21 / 01 01 56 60 06",
  };
}

export function formatPointFocalDetails(pf: PointFocal): string {
  const lines = [
    `Point focal pour le retrait des bons de prise en charge MU2S :`,
    `- ${pf.zoneOrVille} : ${pf.nom}`,
  ];
  if (pf.secteurs) {
    lines.push(`  Secteurs : ${pf.secteurs}`);
  }
  lines.push(`  Contact : ${pf.contact}`);
  return lines.join("\n");
}

export function buildInstitutionalRecommendationBlock(communeOrZone: string): string {
  const pf = resolvePointFocal(communeOrZone);
  return [
    INSTITUTIONAL_RECOMMENDATION_TEXT,
    "",
    formatPointFocalDetails(pf),
  ].join("\n");
}
