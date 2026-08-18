import { getGemini } from "../providers/gemini.provider.js";
import { prisma } from "../../services/prisma.service.js";
import { z } from "zod";

const MODEL_NAME = "gemini-3.5-flash";

const duplicateDetectionSchema = z.object({
  relationship: z.enum(["DUPLICATE", "COMMON_PROBLEM", "UNRELATED"]),
  duplicateScore: z.number().min(0).max(1),
  explanation: z.string().min(1),
});

export type DuplicateDetectionResult = z.infer<typeof duplicateDetectionSchema>;

interface CandidateGrievance {
  ticketId: string;
  title: string;
  description: string;
  category: string | null;
  departmentId: string | null;
  citizenId: string;
  location: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
}

export async function detectDuplicateGrievance(
  title: string,
  description: string,
  category: string | null,
  departmentId: string | null,
  citizenId: string,
): Promise<DuplicateDetectionResult> {
  /*
   * Retrieve active grievances that could be related.
   *
   * We intentionally do NOT filter by citizen or location here.
   *
   * Why?
   * - Same citizen + same problem -> DUPLICATE
   * - Different citizens + same problem -> COMMON_PROBLEM
   * - Different locations can still represent the same broader civic problem.
   */

  const candidates = await prisma.grievance.findMany({
    where: {
      status: {
        notIn: ["RESOLVED", "REJECTED"],
      },

      /*
       * Category and department are useful candidate filters,
       * but they are NOT themselves proof of duplication.
       */
      ...(category ? { category } : {}),
      ...(departmentId ? { departmentId } : {}),
    },

    select: {
      ticketId: true,
      title: true,
      description: true,
      category: true,
      departmentId: true,
      citizenId: true,
      location: true,
      address: true,
      latitude: true,
      longitude: true,
      createdAt: true,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 20,
  });

  if (candidates.length === 0) {
    return {
      relationship: "UNRELATED",
      duplicateScore: 0,
      explanation: "No similar active grievances were found for comparison.",
    };
  }

  console.log("DUPLICATE CANDIDATES:", candidates);

  const candidateText = candidates
    .map(
      (candidate, index) => `
CANDIDATE ${index + 1}

Citizen ID: ${candidate.citizenId}
Ticket ID: ${candidate.ticketId}

Title:
${candidate.title}

Description:
${candidate.description}

Category:
${candidate.category ?? "Not specified"}

Location:
${candidate.location ?? "Not specified"}

Address:
${candidate.address ?? "Not specified"}

Coordinates:
${
  candidate.latitude !== null && candidate.longitude !== null
    ? `${candidate.latitude}, ${candidate.longitude}`
    : "Not specified"
}

Created At:
${candidate.createdAt.toISOString()}
`,
    )
    .join("\n---\n");

  const prompt = `
You are the AI grievance similarity and duplicate detection engine
for the Unified Citizen Governance System.

Analyze the NEW GRIEVANCE against the EXISTING GRIEVANCES.

Your task is to determine whether the new grievance is:

1. DUPLICATE
2. COMMON_PROBLEM
3. UNRELATED

IMPORTANT:

The NEW CITIZEN ID is:

${citizenId}

==================================================
DUPLICATE RULE — SAME CITIZEN
==================================================

If the SAME CITIZEN has already submitted an active grievance
describing the same or substantially similar problem, classify it as:

"DUPLICATE"

A citizen submitting the same problem again should be considered
a duplicate even if the wording is different.

Examples:

Same citizen:
"Street light is not working on my road."

Later:
"The street lamp near my house is still broken."

These should be considered a DUPLICATE if the evidence indicates
they refer to the same underlying problem.

==================================================
COMMON PROBLEM RULE — DIFFERENT CITIZENS
==================================================

If DIFFERENT CITIZENS report the same underlying civic problem,
classify the relationship as:

"COMMON_PROBLEM"

Do NOT call these duplicate citizen submissions.

Example:

Citizen A:
"Street lights are not working in Civil Lines."

Citizen B:
"Several street lights are broken in another road."

These may represent a COMMON_PROBLEM even though the locations differ.

==================================================
LOCATION
==================================================

Location is useful evidence, but it is NOT a mandatory requirement.

Rules:

- Same or nearby location strongly supports the same incident.
- Different locations do NOT automatically mean unrelated.
- The same civic problem can occur across multiple locations.
- Missing location must NOT automatically produce a low score.
- Never invent a location.

==================================================
TIME
==================================================

Consider when grievances were created.

- Similar time strengthens the possibility of a shared incident.
- A long time gap may indicate a recurring problem rather than
  the exact same incident.
- Do not invent timing information.

==================================================
PROBLEM SIMILARITY
==================================================

Focus on the actual underlying civic problem.

These can represent the same problem:

"Water supply stopped."

"No water coming since yesterday."

"Our locality has no water."

These can represent the same underlying problem even when
the wording is different.

==================================================
CATEGORY AND DEPARTMENT
==================================================

Matching category and department strengthen the relationship.

However:

Category alone is NOT enough to classify a grievance as duplicate.

==================================================
MULTIPLE CITIZENS
==================================================

If multiple independent citizens report the same underlying civic
problem, confidence in a COMMON_PROBLEM should increase.

For example:

1 citizen -> possible issue
3 citizens -> stronger evidence
10 citizens -> very strong evidence of a recurring/common issue
20+ citizens -> potentially extremely strong evidence

However, the complaints must actually describe the same underlying
problem.

Do NOT increase the score merely because many grievances exist.

==================================================
IMPORTANT DISTINCTION
==================================================

SAME CITIZEN + SAME/SIMILAR ACTIVE PROBLEM
→ DUPLICATE

DIFFERENT CITIZENS + SAME UNDERLYING CIVIC PROBLEM
→ COMMON_PROBLEM

DIFFERENT PROBLEMS
→ UNRELATED

Same problem + same location + similar time
→ strong evidence of the same incident.

Same problem + different locations
→ may still be a strong COMMON_PROBLEM.

==================================================
DO NOT
==================================================

- Do not delete grievances.
- Do not reject grievances.
- Do not merge grievances.
- Do not invent facts.
- Do not assume that category alone means duplicate.
- Do not assume different locations mean unrelated.
- Do not assume missing location means unrelated.

Every citizen grievance must remain individually recorded.

==================================================
SCORE
==================================================

0.00 - 0.29
Unrelated or almost no relationship.

0.30 - 0.49
Weak relationship.

0.50 - 0.69
Possibly related.

0.70 - 0.84
Strong relationship.

0.85 - 0.94
Very strong relationship.

0.95 - 1.00
Extremely strong evidence.

For SAME CITIZEN + SAME ACTIVE PROBLEM:
Use DUPLICATE with a high score.

For DIFFERENT CITIZENS + SAME UNDERLYING PROBLEM:
Use COMMON_PROBLEM with a strong score.

For genuinely different problems:
Use UNRELATED with a low score.

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Do not use markdown.

Do not include code fences.

Return exactly:

{
  "relationship": "DUPLICATE",
  "duplicateScore": 0.95,
  "explanation": "brief explanation"
}

The relationship must be exactly one of:

"DUPLICATE"
"COMMON_PROBLEM"
"UNRELATED"

The duplicateScore must be a number between 0 and 1.

==================================================
NEW GRIEVANCE
==================================================

Citizen ID:
${citizenId}

Title:
${title}

Description:
${description}

Category:
${category ?? "Not specified"}

Department ID:
${departmentId ?? "Not specified"}

==================================================
EXISTING GRIEVANCES
==================================================

${candidateText}
`;

  const response = await getGemini().models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty duplicate-detection response");
  }

  console.log("RAW DUPLICATE DETECTION RESPONSE:");
  console.log(text);

  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned invalid duplicate-detection JSON");
  }

  const result = duplicateDetectionSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error(
      `Duplicate detection failed validation: ${result.error.message}`,
    );
  }

  return result.data;
}
