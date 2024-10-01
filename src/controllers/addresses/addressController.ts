import { FastifyPluginAsync } from "fastify";
import { createAddress } from "../../models/addresses/createAddress";
import { deleteAddress } from "../../models/addresses/deleteAddress";
import { getSavedAddresses } from "../../models/addresses/getSavedAddresses";
import { getAddressById } from "../../models/addresses/getAddressById";
import {
  addressIdSchema,
  createAddressSchema,
  deleteAddressSchema,
} from "../../models/addresses/validations/schemas";

export const addressController: FastifyPluginAsync = async (app) => {
  app.post(
    "/address",
    {
      schema: {
        body: createAddressSchema,
      },
    },
    createAddress
  );

  app.delete(
    "/address/:id",
    {
      schema: {
        params: deleteAddressSchema,
      },
    },
    deleteAddress
  );

  app.get("/user/address", getSavedAddresses);

  app.get(
    "/address/:id",
    {
      schema: {
        params: addressIdSchema,
      },
    },
    getAddressById
  );
};
