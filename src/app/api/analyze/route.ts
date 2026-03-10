import { NextRequest, NextResponse } from "next/server";
import { analyzeHair } from "@/lib/claude";
import { createServerClient } from "@/lib/supabase";
import type { AnalyzeRequest, AnalyzeResponse } from "@/lib/types";

export const maxDuration = 60; // 60 second timeout

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const { photos, textDescription, onboardingData } = body;

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one photo is required" },
        { status: 400 }
      );
    }

    if (photos.length > 5) {
      return NextResponse.json(
        { success: false, error: "Maximum 5 photos allowed" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: "AI service not configured" },
        { status: 500 }
      );
    }

    // Run analysis via Claude
    const result = await analyzeHair(
      photos,
      textDescription || "",
      onboardingData || {}
    );

    // Save analysis to Supabase (optional, may fail if user not authenticated)
    let analysisId: string | undefined;
    try {
      const serverClient = createServerClient();

      // Get user from auth header if present
      const authHeader = request.headers.get("authorization");
      let userId: string | undefined;

      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const {
          data: { user },
        } = await serverClient.auth.getUser(token);
        userId = user?.id;
      }

      const { data, error } = await serverClient
        .from("analyses")
        .insert({
          user_id: userId || null,
          photos: [], // Not storing base64 in DB, only Supabase Storage URLs
          text_input: textDescription || "",
          ai_response_json: result,
          onboarding_data: onboardingData || {},
        })
        .select("id")
        .single();

      if (!error && data) {
        analysisId = data.id;

        // Update user's profile with latest hair profile if authenticated
        if (userId) {
          await serverClient
            .from("profiles")
            .update({ hair_profile_json: result })
            .eq("id", userId);
        }
      }
    } catch (dbError) {
      // Non-fatal: DB save failure doesn't break the analysis
      console.error("Failed to save analysis to DB:", dbError);
    }

    return NextResponse.json({
      success: true,
      analysisId,
      result,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    const message =
      error instanceof Error ? error.message : "Analysis failed";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
