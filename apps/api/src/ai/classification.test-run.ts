import "dotenv/config";
import { classifyGrievance } from "./services/classification.service.js";

const result = await classifyGrievance(
  "Street light not working",
  "The street light outside our residential area has been broken for several days and the road becomes completely dark at night.",
);

console.log(JSON.stringify(result, null, 2));
