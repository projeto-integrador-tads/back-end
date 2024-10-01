import env from "../../../env";

interface DistanceResult {
  distance: number;
  duration: string;
}

export async function calculateDistanceCordinates(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<DistanceResult | null> {
  const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${startLat},${startLng}&destinations=${endLat},${endLng}&key=${env.GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error(
        "Erro desconhecido",
        data.error_message || "Erro desconhecido"
      );
      return null;
    }

    const element = data.rows[0].elements[0];
    if (element.status !== "OK") {
      console.error("Erro na resposta:", element.status);
      return null;
    }

    return {
      distance: element.distance.value,
      duration: element.duration.text,
    };
  } catch (error) {
    console.error("Erro durante o cálculo:", error);
    return null;
  }
}
