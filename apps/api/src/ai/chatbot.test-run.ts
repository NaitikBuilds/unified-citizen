import "dotenv/config";

import { chatWithCitizen } from "./services/chatbot.service.js";

const response = await chatWithCitizen(
  "cmsy9fix40000tcmqzkwxqzzl",
  "Where are my grievances and what is their current status?",
);

console.log("CHATBOT RESPONSE:");
console.log(response);
