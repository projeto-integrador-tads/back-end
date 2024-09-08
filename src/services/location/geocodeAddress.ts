interface Location {
  lat: number;
  lng: number;
  city: string;
  formattedAddress: string;
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
      const result = data.results[0];
      const location = result.geometry.location;

      // Procura pela cidade nos componentes de endereço
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

      return {
        lat: location.lat,
        lng: location.lng,
        city: city,
        formattedAddress: result.formatted_address,
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
