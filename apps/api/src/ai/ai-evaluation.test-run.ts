import "dotenv/config";

import { classifyGrievance } from "./services/classification.service.js";

const testCases = [
  {
    name: "Water Supply",
    title: "No water supply",
    description: "There has been no water supply in our locality for two days.",
  },
  {
    name: "Street Lighting",
    title: "Street lights not working",
    description:
      "Several street lights are not working and the road becomes dark at night.",
  },
  {
    name: "Electricity",
    title: "Frequent power cuts",
    description:
      "Our area is experiencing frequent electricity outages every evening.",
  },
  {
    name: "Road",
    title: "Large pothole on road",
    description:
      "A large pothole has developed on the main road and is causing difficulty for vehicles.",
  },
  {
    name: "Healthcare",
    title: "Government hospital issue",
    description:
      "The government hospital has insufficient basic facilities for patients.",
  },
];

let aiSuccess = 0;
let fallbackCount = 0;

console.log("\n========== AI EVALUATION ==========\n");

for (let i = 0; i < testCases.length; i++) {
  const test = testCases[i];

  console.log(`\n[${i + 1}/${testCases.length}] ${test.name}`);
  console.log(`Title: ${test.title}`);

  const result = await classifyGrievance(test.title, test.description);

  console.log("Category   :", result.category);
  console.log("Department :", result.department);
  console.log("Priority   :", result.priority);
  console.log("Severity   :", result.severity);
  console.log("Sentiment  :", result.sentiment);
  console.log("Confidence :", result.confidence);
  console.log("Summary    :", result.summary);

  /*
   * Our fallback classification has confidence = 0
   * and category = "Other".
   */
  if (
    result.confidence === 0 &&
    result.category === "Other" &&
    result.department === "OTHER"
  ) {
    fallbackCount++;
    console.log("AI STATUS  : FALLBACK");
  } else {
    aiSuccess++;
    console.log("AI STATUS  : SUCCESS");
  }
}

console.log("\n========== RESULT ==========");
console.log(`AI responses : ${aiSuccess}/${testCases.length}`);
console.log(`Fallbacks    : ${fallbackCount}/${testCases.length}`);
console.log(
  `AI success rate: ${((aiSuccess / testCases.length) * 100).toFixed(1)}%`,
);
