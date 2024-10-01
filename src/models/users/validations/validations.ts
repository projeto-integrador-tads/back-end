import { models } from "../../models";
import { ValidationError } from "../../../exeptions/validationError";

export async function getUser(id: string | undefined) {
  const user = await models.user.findFirst({ where: { id } });
  if (!user || !user.active) throw new ValidationError("O usuário não existe.");
  return user;
}
