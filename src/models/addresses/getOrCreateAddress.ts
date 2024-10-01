import { geocodeCoordinates } from "../../services/location/geocodeCordinates";
import { models } from "../models";

export async function getOrCreateAddress(
  locationId?: string,
  latitude?: number,
  longitude?: number
) {
  if (locationId) {
    const address = await models.address.findUnique({
      where: { id: locationId },
    });
    if (address) {
      return address;
    }
  }

  if (latitude && longitude) {
    const geocoded = await geocodeCoordinates(latitude, longitude);
    if (!geocoded) {
      return null;
    }
    return await models.address.create({
      data: {
        latitude,
        longitude,
        city: geocoded.city,
        formattedAddress: geocoded.formattedAddress,
      },
    });
  }

  return null;
}
