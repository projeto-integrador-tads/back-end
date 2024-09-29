import env from "../../../env";

interface Location {
  city: string;
  formattedAddress: string;
}

export async function geocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<Location | null> {
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${env.GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === "OK") {
      const result = data.results[0];
      const addressComponents = result.address_components;
      let city = "";
      for (const component of addressComponents) {
        if (
          component.types.includes("locality") ||
          component.types.includes("administrative_area_level_2")
        ) {
          city = component.long_name;
          break;
        }
      }

      const formattedAddress = result.formatted_address
        .replace(/\b[\w+]+\+\w+\b/g, "")
        .trim();

      return {
        city,
        formattedAddress,
      };
    }
    console.error(
      "Falha na geocodificação:",
      data.error_message || "Erro desconhecido"
    );
    return null;
  } catch (error) {
    console.error("Erro durante a geocodificação:", error);
    return null;
  }
}
