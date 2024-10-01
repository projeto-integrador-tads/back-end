import env from "../../../env";

interface DistanceResult {
  distance: number;
  duration: string;
}

const apiKey = env.GOOGLE_MAPS_API_KEY;

export async function calculateDistance(
  origin: string,
  destination: string
): Promise<DistanceResult | null> {
  if (!apiKey) {
    throw new Error("Google Maps API key is missing");
  }

  const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error(
        "Error in response:",
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
    console.error("Erro durante o cálculo de distância:", error);
    return null;
  }
}
