interface DistanceResult {
  distance: number;
  duration: string;
}

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

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
        data.error_message || "Unknown error"
      );
      return null;
    }

    const element = data.rows[0].elements[0];
    if (element.status !== "OK") {
      console.error("Error in response:", element.status);
      return null;
    }

    return {
      distance: element.distance.value,
      duration: element.duration.text,
    };
  } catch (error) {
    console.error("Error during distance calculation:", error);
    return null;
  }
}
