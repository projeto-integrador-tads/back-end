interface Location {
  lat: number;
  lng: number;
}

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

export async function geocodeAddress(
  address: string
): Promise<Location | null> {
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === "OK") {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }
    console.error("Geocoding failed:", data.error_message || "Unknown error");
    return null;
  } catch (error) {
    console.error("Error during geocoding:", error);
    return null;
  }
}
