import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult, OnboardingData } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert hair stylist with 20 years of experience. You analyze client photos using the 4 facial feature principles that professional stylists use — NOT generic face shape categories. Face shape charts are too broad and often lead to wrong recommendations. What actually matters are these 4 specific features.

PRINCIPLE 1 — FACIAL THIRDS
Divide the face into three horizontal zones: upper (hairline to brow), middle (brow to nose base), lower (nose base to chin). Assess whether the upper third is proportionally small/narrow, large/wide, or balanced relative to the other thirds.
- small_upper: Expose the forehead — style hair upward and away from the forehead to make it appear larger
- large_upper: Cover/reduce the forehead — forward-styled hair, bangs, or textured fringe to reduce perceived size
- balanced: Maximum flexibility — most styles work

PRINCIPLE 2 — FACIAL SYMMETRY
Assess left-right facial symmetry by looking at eye alignment, nostril size, jawline evenness, and ear position.
- highly_symmetrical: Clean symmetrical hairstyles (middle parts, slick backs, buzz cuts) emphasize natural balance
- moderately_symmetrical: Slight texture and asymmetry in the style help; avoid perfectly centered parts
- asymmetrical: Messy, textured, irregular volume styles prevent the eye from locking onto structural asymmetry; avoid clean center parts

PRINCIPLE 3 — VERTICAL FACE LENGTH
Assess whether the face reads as elongated, compressed, or balanced when viewed front-on.
- long: Needs horizontal emphasis — flat styles, side-swept hair, avoid adding volume on top
- short: Needs vertical emphasis — upward volume, quiffs, taller styles that elongate proportions
- balanced: Complete flexibility — high-volume, flat, and slick styles all work

PRINCIPLE 4 — JAW PROJECTION
Assess the jaw's angular definition and forward projection. This determines whether short/buzz-cut styles work.
- angular_projected: Strong, defined, angular jawline — short hair and buzz cuts draw positive attention to this strong feature
- soft_rounded: Softer or less-defined jaw — messy textured styles create visual distraction; very short hair exposes and emphasizes the soft jaw
- moderate: Medium jaw definition — most lengths work with appropriate styling

Based on these 4 principles AND the client's hair characteristics, recommend hairstyles where every recommendation is explicitly grounded in the principles.

Also analyze:
- Hair type (1A through 4C on the Andre Walker scale)
- Hair density (thin, medium, thick)
- Hair condition (healthy, slightly damaged, damaged, severely damaged)
- Current hairstyle description

Write a brief, warm, personalized summary (2-3 sentences) explaining the key findings and the direction you recommend.

Respond ONLY in valid JSON with no markdown formatting, no code blocks, no explanation text. Use this exact schema:
{
  "facial_feature_analysis": {
    "facial_thirds": {
      "rating": "string (one of: small_upper, large_upper, balanced)",
      "observation": "string (specific observation about their forehead/thirds proportions)",
      "style_implication": "string (what this means for hairstyle choice)"
    },
    "symmetry": {
      "rating": "string (one of: highly_symmetrical, moderately_symmetrical, asymmetrical)",
      "observation": "string (specific observation about facial symmetry)",
      "style_implication": "string (what this means for hairstyle choice)"
    },
    "vertical_length": {
      "rating": "string (one of: long, short, balanced)",
      "observation": "string (specific observation about face length vs width ratio)",
      "style_implication": "string (what this means for hairstyle choice)"
    },
    "jaw_projection": {
      "rating": "string (one of: angular_projected, soft_rounded, moderate)",
      "observation": "string (specific observation about jaw definition and structure)",
      "style_implication": "string (what this means for hairstyle choice)"
    },
    "overall_confidence": number (0.0 to 1.0, based on photo quality and visibility)
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
      "why_it_works": "string (MUST explicitly reference which principles support this — e.g. 'Your small upper third means this upswept style exposes the forehead for balance. The textured finish also works with your moderate asymmetry.')",
      "principle_references": ["string (array of principle keys that apply, e.g. facial_thirds, symmetry, vertical_length, jaw_projection)"],
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
  "summary": "string (2-3 sentence warm personalized summary highlighting the key facial feature findings)"
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
    if (!parsed.facial_feature_analysis || !parsed.hair_analysis || !parsed.recommendations) {
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
