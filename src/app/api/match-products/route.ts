import { NextRequest, NextResponse } from "next/server";
import { matchProducts } from "@/lib/products";
import type { MatchProductsRequest, MatchProductsResponse } from "@/lib/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<MatchProductsResponse>> {
  try {
    const body = (await request.json()) as MatchProductsRequest;
    const { productRecommendations, hairType, concerns } = body;

    if (!productRecommendations || productRecommendations.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product recommendations are required" },
        { status: 400 }
      );
    }

    const products = await matchProducts(
      productRecommendations,
      hairType || "all",
      concerns || []
    );

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Product matching error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to match products",
      },
      { status: 500 }
    );
  }
}
