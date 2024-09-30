import { FastifyInstance } from "fastify";
import { models } from "../../models/models";
import { dayjs } from "../../utils/dayjs";
import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";

export function setupTokenCleanupTask(app: FastifyInstance) {
  const task = new AsyncTask("clear expired tokens", async () => {
    try {
      await models.token.deleteMany({
        where: {
          expiresAt: {
            lt: dayjs().toDate(),
          },
        },
      });
    } catch (error) {
      app.log.error("Erro ao limpar os tokens:", error);
    }
  });

  const job = new SimpleIntervalJob({ hours: 24, runImmediately: true }, task, {
    id: "clear-expired-tokens",
    preventOverrun: true,
  });

  return job;
}
