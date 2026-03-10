import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult, OnboardingData } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert hair stylist and trichologist with 20 years of experience. You are analyzing photos of a client to provide personalized hairstyle and hair care recommendations.

Analyze the provided photos and text description carefully. Identify:
1. Face shape (oval, round, square, heart, oblong, diamond)
2. Hair type (1A through 4C on the Andre Walker scale)
3. Hair density (thin, medium, thick)
4. Hair condition (healthy, slightly damaged, damaged, severely damaged)
5. Current hairstyle description
6. Forehead size and hairline pattern
7. Jaw structure and facial proportions

Based on your analysis, provide hairstyle recommendations that:
- Complement the identified face shape
- Work with (not against) the natural hair type
- Match the client stated maintenance preferences
- Account for any concerns or constraints mentioned

Also write a brief, warm, personalized summary paragraph (2-3 sentences) about the client's hair and the direction you are recommending.

Respond ONLY in valid JSON with no markdown formatting, no code blocks, no explanation text. Use this exact schema:
{
  "face_analysis": {
    "shape": "string (one of: oval, round, square, heart, oblong, diamond)",
    "confidence": number (0.0 to 1.0),
    "notable_features": ["string"]
  },
  "hair_analysis": {
    "type": "string (e.g. 2B, 3A, etc.)",
    "texture": "string",
    "density": "string (one of: thin, medium, thick)",
    "condition": "string (one of: healthy, slightly damaged, damaged, severely damaged)",
    "current_style": "string"
  },
  "recommendations": [
    {
      "style_name": "string",
      "description": "string",
      "why_it_works": "string",
      "maintenance_level": "string (one of: low, medium, high)",
      "barber_instructions": "string",
      "search_keywords": ["string"]
    }
  ],
  "product_recommendations": [
    {
      "category": "string (one of: shampoo, conditioner, styling, treatment, tool)",
      "what_to_look_for": "string",
      "key_ingredients": ["string"],
      "avoid_ingredients": ["string"],
      "usage_tip": "string"
    }
  ],
  "summary": "string (2-3 sentence warm personalized summary)"
}`;

const STRICT_SYSTEM_PROMPT = `${SYSTEM_PROMPT}

CRITICAL: Your response must be ONLY valid JSON. No text before or after. No markdown. No code blocks. Start with { and end with }. Double check that all strings are properly escaped and the JSON is complete and valid.`;

function buildUserMessage(
  photos: string[],
  textDescription: string,
  onboardingData: Partial<OnboardingData>
): Anthropic.MessageParam {
  const content: Anthropic.ContentBlockParam[] = [];

  // Add photos
  photos.forEach((photo, index) => {
    // Strip data URL prefix if present
    const base64Data = photo.includes(",") ? photo.split(",")[1] : photo;
    const mediaType = photo.includes("image/png")
      ? "image/png"
      : photo.includes("image/webp")
      ? "image/webp"
      : "image/jpeg";

    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType,
        data: base64Data,
      },
    } as Anthropic.ImageBlockParam);

    content.push({
      type: "text",
      text: `Photo ${index + 1} of ${photos.length}`,
    });
  });

  // Build context from onboarding data
  const contextParts: string[] = [];

  if (textDescription) {
    contextParts.push(`Client description: ${textDescription}`);
  }

  if (onboardingData.hairType) {
    contextParts.push(`Reported hair type: ${onboardingData.hairType}`);
  }

  if (onboardingData.currentLength) {
    const lengthLabels: Record<number, string> = {
      1: "very short (buzz cut)",
      2: "short",
      3: "short-medium",
      4: "medium-short",
      5: "medium",
      6: "medium-long",
      7: "long",
      8: "very long",
      9: "extra long",
      10: "extremely long",
    };
    const rounded = Math.round(onboardingData.currentLength);
    contextParts.push(
      `Current length: ${lengthLabels[rounded] || "medium"} (${rounded}/10)`
    );
  }

  if (onboardingData.concerns) {
    const activeConcerns = Object.entries(onboardingData.concerns)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (activeConcerns.length > 0) {
      contextParts.push(`Hair concerns: ${activeConcerns.join(", ")}`);
    }
  }

  if (onboardingData.maintenanceLevel) {
    contextParts.push(
      `Preferred maintenance level: ${onboardingData.maintenanceLevel}`
    );
  }

  if (onboardingData.styleVibe) {
    contextParts.push(`Style vibe preference: ${onboardingData.styleVibe}`);
  }

  if (onboardingData.constraints) {
    contextParts.push(`Constraints: ${onboardingData.constraints}`);
  }

  content.push({
    type: "text",
    text: contextParts.length > 0
      ? `Please analyze these photos and provide personalized recommendations.\n\n${contextParts.join("\n")}\n\nProvide 3 to 5 hairstyle recommendations and product recommendations for each main category.`
      : "Please analyze these photos and provide personalized hairstyle and hair care recommendations. Provide 3 to 5 hairstyle recommendations.",
  });

  return { role: "user", content };
}

function extractJSON(text: string): string {
  // Try to find JSON between first { and last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }
  return text;
}

export async function analyzeHair(
  photos: string[],
  textDescription: string,
  onboardingData: Partial<OnboardingData>,
  retryWithStrictPrompt = false
): Promise<AnalysisResult> {
  const systemPrompt = retryWithStrictPrompt
    ? STRICT_SYSTEM_PROMPT
    : SYSTEM_PROMPT;
  const userMessage = buildUserMessage(photos, textDescription, onboardingData);

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: systemPrompt,
    messages: [userMessage],
  });

  const response = await stream.finalMessage();

  // Extract text content
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const rawText = textBlock.text.trim();
  const jsonText = extractJSON(rawText);

  try {
    const parsed = JSON.parse(jsonText) as AnalysisResult;

    // Validate required fields
    if (!parsed.face_analysis || !parsed.hair_analysis || !parsed.recommendations) {
      throw new Error("Missing required fields in response");
    }

    return parsed;
  } catch {
    if (!retryWithStrictPrompt) {
      // Retry once with stricter prompt
      console.warn("First parse attempt failed, retrying with strict prompt");
      return analyzeHair(photos, textDescription, onboardingData, true);
    }
    throw new Error(`Failed to parse Claude response as JSON: ${rawText.slice(0, 200)}`);
  }
}
