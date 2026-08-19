import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");
import "dotenv/config";

import { detectDuplicateGrievance } from "./services/duplicate-detection.service.js";

async function main() {
  const result = await detectDuplicateGrievance(
    "Water supply interruption",
    "There has been no water supply in our locality since yesterday morning.",
    "Water Supply",
    "cmsrzow340001zgftgzadmx8k",
    "cmsrzow4d000gzgftr6nq2avi",
  );

  console.log("DUPLICATE DETECTION RESULT:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
