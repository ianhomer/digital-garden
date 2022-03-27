import pino from "pino";

export const logger = pino({
  name: "garden",
  level: process.env.LOG_LEVEL || "debug",
});
