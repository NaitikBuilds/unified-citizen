import "dotenv/config";

import { detectSpam } from "./services/spam-detection.service.js";

async function main(): Promise<void> {
  const legitimateCase = await detectSpam(
    "Street light broken in residential area",
    "The street light near our residential road has not been working for several days, making the road dark at night.",
  );

  console.log("\nLEGITIMATE GRIEVANCE RESULT:");
  console.log(JSON.stringify(legitimateCase, null, 2));

  const spamCase = await detectSpam(
    "FREE MONEY CLICK NOW",
    "CLICK CLICK CLICK!!! BUY NOW!!! FREE OFFER!!! http://example.com",
  );

  console.log("\nSPAM GRIEVANCE RESULT:");
  console.log(JSON.stringify(spamCase, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
