import {
  findPrestatairesForResolvedCommune,
  formatNoPrestatairesMessage,
  formatPrestatairesMessage,
  GEO_DENIED_MESSAGE,
  GEO_ERROR_MESSAGE,
  resolveCommuneFromNominatim,
  type Prestataire,
} from "@/lib/prestataires";

export async function fetchPrestatairesClient(): Promise<Prestataire[]> {
  const res = await fetch("/prestataires.json");
  if (!res.ok) throw new Error("Liste prestataires indisponible");
  return res.json() as Promise<Prestataire[]>;
}

export async function resolveNearbyPrestataires(
  userLabel: string
): Promise<{ userContent: string; assistantContent: string }> {
  if (!navigator.geolocation) {
    return { userContent: userLabel, assistantContent: GEO_DENIED_MESSAGE };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lon } = position.coords;
          const geoRes = await fetch(
            `/api/geocode/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
          );
          if (!geoRes.ok) throw new Error("Géocodage échoué");
          const geoData = await geoRes.json();
          const prestataires = await fetchPrestatairesClient();
          const communeMatch = resolveCommuneFromNominatim(
            geoData.address ?? {},
            prestataires
          );

          if (!communeMatch) {
            resolve({ userContent: userLabel, assistantContent: GEO_ERROR_MESSAGE });
            return;
          }

          const matched = findPrestatairesForResolvedCommune(
            prestataires,
            communeMatch
          );
          const communeLabel = communeMatch.toUpperCase();

          resolve({
            userContent: userLabel,
            assistantContent:
              matched.length > 0
                ? formatPrestatairesMessage(communeLabel, matched)
                : formatNoPrestatairesMessage(communeLabel),
          });
        } catch (error) {
          console.error("Nearby providers error:", error);
          resolve({ userContent: userLabel, assistantContent: GEO_ERROR_MESSAGE });
        }
      },
      () => {
        resolve({ userContent: userLabel, assistantContent: GEO_DENIED_MESSAGE });
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  });
}
