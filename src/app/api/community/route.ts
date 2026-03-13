import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hairType = searchParams.get("hair_type");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const serverClient = createServerClient();

    let query = serverClient
      .from("community_posts")
      .select("*, profiles(display_name, avatar_url)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (hairType && hairType !== "all") {
      query = query.eq("hair_type", hairType);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, posts: data || [] });
  } catch (error) {
    console.error("Community GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { before_photo, after_photo, style_name, caption, hair_type } = body;

    if (!before_photo || !after_photo || !style_name) {
      return NextResponse.json(
        { success: false, error: "before_photo, after_photo, and style_name are required" },
        { status: 400 }
      );
    }

    const serverClient = createServerClient();

    // Get authenticated user from Bearer token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const {
      data: { user },
      error: authError,
    } = await serverClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid authentication" },
        { status: 401 }
      );
    }

    const { data, error } = await serverClient
      .from("community_posts")
      .insert({
        user_id: user.id,
        before_photo,
        after_photo,
        style_name,
        caption: caption || null,
        hair_type: hair_type || null,
        likes_count: 0,
      })
      .select("*, profiles(display_name, avatar_url)")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, post: data });
  } catch (error) {
    console.error("Community POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create post" },
      { status: 500 }
    );
  }
}
