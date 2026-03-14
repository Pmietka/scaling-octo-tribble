import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const serverClient = createServerClient();

    // Get authenticated user
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

    // Check if user already liked this post
    const { data: existingLike } = await serverClient
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();

    let liked: boolean;

    if (existingLike) {
      // Unlike
      await serverClient
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      await serverClient.rpc("decrement_likes", { post_id: postId });
      liked = false;
    } else {
      // Like
      await serverClient
        .from("post_likes")
        .insert({ post_id: postId, user_id: user.id });

      await serverClient.rpc("increment_likes", { post_id: postId });
      liked = true;
    }

    // Get updated count
    const { data: post } = await serverClient
      .from("community_posts")
      .select("likes_count")
      .eq("id", postId)
      .single();

    return NextResponse.json({
      success: true,
      liked,
      likes_count: post?.likes_count ?? 0,
    });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
