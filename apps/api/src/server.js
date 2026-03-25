import { createApp } from "./app.js";
import { connectToDatabase, disconnectFromDatabase, env } from "./config/index.js";

let httpServer = null;

async function startServer() {
  await connectToDatabase();

  const app = createApp();

  httpServer = app.listen(env.port, () => {
    console.log(`ExamNova API running on port ${env.port} in ${env.nodeEnv} mode`);
  });

  const shutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down ExamNova API...`);

    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }

    await disconnectFromDatabase();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch((error) => {
  console.error("Failed to start ExamNova API", error);
  process.exit(1);
});
