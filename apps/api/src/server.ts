import "dotenv/config";
import app from "./app.js";
import { checkAndProcessSLABreaches } from "./services/sla-check.service.js";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
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
setInterval(runSlaCheck, SLA_CHECK_INTERVAL_MS);