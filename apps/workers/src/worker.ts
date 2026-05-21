const SERVICE_NAME = "workers";
const HEARTBEAT_INTERVAL_MS = 30_000;

let heartbeat: NodeJS.Timeout | undefined;

function start(): void {
  console.info(`${SERVICE_NAME}: ready`);

  heartbeat = setInterval(() => {
    console.info(`${SERVICE_NAME}: heartbeat`);
  }, HEARTBEAT_INTERVAL_MS);
}

function shutdown(signal: NodeJS.Signals): void {
  console.info(`${SERVICE_NAME}: received ${signal}, shutting down`);

  if (heartbeat) {
    clearInterval(heartbeat);
  }

  process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

start();
