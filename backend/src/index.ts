import { env } from "@common/utils/envConfig";
import { initializeSocket } from "./socket";
import { app, logger } from "./server";
import { startStoreReopenJob } from "@common/jobs/store-job";

const port = env.PORT;

const server = app.listen(port, () => {
  const { NODE_ENV, HOST } = env;
  logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${port}`);
});

// Start Socket.IO server using the created HTTP server instance
initializeSocket(server);
startStoreReopenJob();

const onCloseSignal = () => {
  logger.info("sigint received, shutting down");
  server.close(() => {
    logger.info("server closed");
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
