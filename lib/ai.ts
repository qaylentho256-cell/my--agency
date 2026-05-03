import Anthropic from "@anthropic-ai/sdk";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set in .env");
  return new Anthropic({ apiKey });
}

export interface RoofAnalysis {
  squareFootage: number;
  damageLevel: "minor" | "moderate" | "severe";
  damageDescription: string;
  recommendedWork: string[];
  estimatedCost: { low: number; high: number };
  urgency: "low" | "medium" | "high";
}

export async function analyzeRoofPhotos(
  base64Images: string[],
  notes: string,
  roofType: string
): Promise<RoofAnalysis> {
  const imageContent = base64Images.map((img) => ({
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: "image/jpeg" as const,
      data: img.replace(/^data:image\/\w+;base64,/, ""),
    },
  }));

  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          ...imageContent,
          {
            type: "text",
            text: `You are an expert roofing estimator. Analyze these roof photos and provide a detailed assessment.

Roof type: ${roofType || "unknown"}
Additional notes from roofer: ${notes || "none"}

Respond ONLY with valid JSON in this exact format:
{
  "squareFootage": <estimated number>,
  "damageLevel": "<minor|moderate|severe>",
  "damageDescription": "<1-2 sentence description of damage>",
  "recommendedWork": ["<work item 1>", "<work item 2>"],
  "estimatedCost": { "low": <number>, "high": <number> },
  "urgency": "<low|medium|high>"
}

Base cost estimates on current US market rates: ~$4-8/sqft for repairs, ~$8-15/sqft for full replacement.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI did not return valid JSON");

  return JSON.parse(jsonMatch[0]) as RoofAnalysis;
}

export async function generateQuoteEmail(
  analysis: RoofAnalysis,
  homeownerName: string,
  address: string,
  companyName: string
): Promise<{ subject: string; body: string }> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Write a professional roofing quote email to a homeowner. Keep it warm, clear, and under 250 words.

Homeowner: ${homeownerName}
Property: ${address}
Company: ${companyName}
Damage level: ${analysis.damageLevel}
Damage: ${analysis.damageDescription}
Recommended work: ${analysis.recommendedWork.join(", ")}
Estimated cost range: $${analysis.estimatedCost.low.toLocaleString()} - $${analysis.estimatedCost.high.toLocaleString()}
Urgency: ${analysis.urgency}

Respond ONLY with JSON:
{
  "subject": "<email subject>",
  "body": "<email body with line breaks as \\n>"
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI did not return valid JSON");

  return JSON.parse(jsonMatch[0]);
}
