import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");
import "dotenv/config";
import app from "./app.js";
import { prisma } from "./services/prisma.service.js";
import { checkAndProcessSLABreaches } from "./services/sla-check.service.js";
import { cleanupExpiredRefreshTokens } from "./services/refresh-token-cleanup.service.js";

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

// Periodic SLA breach/warning detection. Runs once at startup and then every
// minute. Failures are logged but must not take down the API process.
const SLA_CHECK_INTERVAL_MS = 60_000;

async function runSlaCheck(): Promise<void> {
  try {
    const result = await checkAndProcessSLABreaches();
    if (result.breachedCount > 0) {
      console.log(`SLA check: ${result.breachedCount} grievance(s) breached.`);
    }
  } catch (error) {
    console.error("SLA check failed:", error);
  }
}

runSlaCheck();
const slaCheckInterval = setInterval(runSlaCheck, SLA_CHECK_INTERVAL_MS);

// Low-frequency maintenance: purge refresh tokens that are expired/revoked and
// older than 30 days. Runs hourly; failures are logged, never fatal.
const REFRESH_TOKEN_CLEANUP_INTERVAL_MS = 60 * 60_000;

async function runRefreshTokenCleanup(): Promise<void> {
  try {
    const deleted = await cleanupExpiredRefreshTokens();
    if (deleted > 0) {
      console.log(
        `Refresh token cleanup: removed ${deleted} expired/revoked token(s).`,
      );
    }
  } catch (error) {
    console.error("Refresh token cleanup failed:", error);
  }
}

runRefreshTokenCleanup();
const refreshTokenCleanupInterval = setInterval(
  runRefreshTokenCleanup,
  REFRESH_TOKEN_CLEANUP_INTERVAL_MS,
);

// Graceful shutdown: stop accepting new requests, close the HTTP server, then
// disconnect the database. Guarded against duplicate execution (e.g. SIGINT
// followed by SIGTERM during shutdown).
let shuttingDown = false;

function shutdown(signal: string): void {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  console.log(`${signal} received, shutting down...`);

  clearInterval(slaCheckInterval);
  clearInterval(refreshTokenCleanupInterval);

  server.close((err) => {
    const finish = async (): Promise<void> => {
      try {
        await prisma.$disconnect();
      } catch (error) {
        console.error("Error disconnecting from database:", error);
      }
      process.exit(err ? 1 : 0);
    };

    void finish();
  });

  // Safety net: if in-flight connections keep the server open, force exit so
  // the process does not hang indefinitely.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
