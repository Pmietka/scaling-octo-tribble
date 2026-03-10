import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import type { ClickTrackRequest } from "@/lib/types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as ClickTrackRequest;
    const { productId, sessionId } = body;

    if (!productId || !sessionId) {
      return NextResponse.json(
        { success: false, error: "productId and sessionId are required" },
        { status: 400 }
      );
    }

    const serverClient = createServerClient();

    // Get user if authenticated
    const authHeader = request.headers.get("authorization");
    let userId: string | undefined;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const {
        data: { user },
      } = await serverClient.auth.getUser(token);
      userId = user?.id;
    }

    await serverClient.from("click_events").insert({
      product_id: productId,
      user_id: userId || null,
      session_id: sessionId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Click tracking error:", error);
    // Non-fatal, return success anyway to not block the user
    return NextResponse.json({ success: true });
  }
}
