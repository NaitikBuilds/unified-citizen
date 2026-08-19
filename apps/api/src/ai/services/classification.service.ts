import { getGemini } from "../providers/gemini.provider.js";
import {
  buildClassificationPrompt,
  classificationSystemPrompt,
} from "../prompts/classification.prompt.js";
import {
  aiClassificationSchema,
  type AIClassificationOutput,
} from "../schemas/ai-output.schema.js";

const MODEL_NAME = "gemini-3.5-flash";

/**
 * Smart keyword-based fallback when Gemini is unavailable.
 * Matches keywords in title + description to department codes and categories.
 */
function createFallbackClassification(
  title: string,
  description: string,
): AIClassificationOutput {
  const text = `${title} ${description}`.toLowerCase();

  // Department keyword mapping
  const deptKeywords: Array<{
    code: string;
    category: string;
    keywords: string[];
  }> = [
    {
      code: "WATER",
      category: "Water Supply",
      keywords: [
        "water", "pipe", "leak", "tap", "supply", "drainage",
        "sewage", "borewell", "tanker", "waterlogging", "flood",
      ],
    },
    {
      code: "ELECTRICITY",
      category: "Electricity",
      keywords: [
        "electric", "electricity", "power", "light", "street light",
        "transformer", "wire", "outage", "blackout", "voltage",
        "meter", "bill", "current", "shock",
      ],
    },
    {
      code: "PWD",
      category: "Roads & Infrastructure",
      keywords: [
        "road", "pothole", "pavement", "sidewalk", "bridge",
        "traffic", "signal", "intersection", "highway", "flyover",
        "road repair", "road damage", "broken road",
      ],
    },
    {
      code: "SANITATION",
      category: "Sanitation & Waste",
      keywords: [
        "garbage", "waste", "trash", "dustbin", "cleaning",
        "sanitation", "sewer", "overflow", "litter", "dump",
        "recycle", "compost", "swachh",
      ],
    },
    {
      code: "POLICE",
      category: "Public Safety",
      keywords: [
        "police", "crime", "theft", "robbery", "assault",
        "safety", "security", "harassment", "violation",
        "illegal", "fraud", "attack", "murder", "kidnap",
      ],
    },
    {
      code: "HEALTH",
      category: "Healthcare",
      keywords: [
        "hospital", "health", "medical", "doctor", "medicine",
        "clinic", "ambulance", "disease", "vaccine", "pharmacy",
        "patient", "treatment", "infection", "epidemic",
      ],
    },
    {
      code: "EDUCATION",
      category: "Education",
      keywords: [
        "school", "education", "teacher", "student", "college",
        "university", "exam", "admission", "scholarship",
        "library", "classroom", "curriculum",
      ],
    },
    {
      code: "TRANSPORT",
      category: "Transport",
      keywords: [
        "bus", "train", "metro", "transport", "auto", "cab",
        "parking", "station", "route", "fare", "ticket",
        "public transport", "commute",
      ],
    },
    {
      code: "PWD",
      category: "Public Works",
      keywords: [
        "building", "construction", "demolition", "encroachment",
        "illegal construction", "permission", "inspection",
        "maintenance", "repair", "infrastructure",
      ],
    },
    {
      code: "MUNICIPAL",
      category: "Municipal Services",
      keywords: [
        "municipal", "tax", "property", "birth certificate",
        "death certificate", "license", "permit", "registration",
        "trade", "market", "shop",
      ],
    },
  ];

  // Priority keywords
  const priorityKeywords: Array<{
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    keywords: string[];
  }> = [
    {
      priority: "CRITICAL",
      keywords: [
        "urgent", "emergency", "death", "fire", "flood",
        "collapse", "danger", "life threatening", "immediate",
        "accident", "injured",
      ],
    },
    {
      priority: "HIGH",
      keywords: [
        "serious", "major", "severe", "broken", "blocked",
        "complete", "total", "widespread", "affecting many",
        "multiple", "escalat",
      ],
    },
    {
      priority: "MEDIUM",
      keywords: [
        "issue", "problem", "concern", "complaint", "request",
        "need", "should", "please", "fix",
      ],
    },
  ];

  // Match department
  let bestDept = deptKeywords[deptKeywords.length - 1]; // Default: MUNICIPAL
  let bestScore = 0;
  for (const dept of deptKeywords) {
    let score = 0;
    for (const kw of dept.keywords) {
      if (text.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestDept = dept;
    }
  }

  // Match priority
  let priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM";
  for (const p of priorityKeywords) {
    for (const kw of p.keywords) {
      if (text.includes(kw)) {
        priority = p.priority;
        break;
      }
    }
  }

  // Determine sentiment
  const negativeWords = [
    "angry", "frustrated", "terrible", "worst", "horrible",
    "disgusted", "unacceptable", "outraged", "furious",
  ];
  const urgentWords = ["urgent", "emergency", "immediately", "asap", "now"];
  let sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "URGENT" = "NEUTRAL";
  for (const w of urgentWords) {
    if (text.includes(w)) {
      sentiment = "URGENT";
      break;
    }
  }
  if (sentiment !== "URGENT") {
    for (const w of negativeWords) {
      if (text.includes(w)) {
        sentiment = "NEGATIVE";
        break;
      }
    }
  }

  // Determine severity based on priority
  const severityMap: Record<string, "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"> = {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    CRITICAL: "CRITICAL",
  };

  return {
    category: bestDept.category,
    department: bestDept.code,
    priority,
    severity: severityMap[priority] || "MEDIUM",
    sentiment,
    confidence: bestScore > 0 ? 0.7 : 0.3,
    summary: `${title}: ${description}`.slice(0, 500),
    explanation: `Smart keyword matching (confidence: ${bestScore > 0 ? "matched" : "low confidence"}). Configure GEMINI_API_KEY for AI-powered classification.`,
  };
}

export async function classifyGrievance(
  title: string,
  description: string,
): Promise<AIClassificationOutput> {
  const prompt = `
${classificationSystemPrompt}

${buildClassificationPrompt(title, description)}
`;

  try {
    const response = await getGemini().models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Gemini returned invalid JSON");
    }

    const result = aiClassificationSchema.safeParse(parsed);

    if (!result.success) {
      throw new Error(
        `Gemini classification failed validation: ${result.error.message}`,
      );
    }

    return result.data;
  } catch (error) {
    console.error(
      "AI classification failed. Using smart keyword fallback:",
      error instanceof Error ? error.message : error,
    );

    return createFallbackClassification(title, description);
  }
}
