import type {
  Product,
  ProductRecommendation,
  MatchedProduct,
} from "./types";
import { createServerClient } from "./supabase";

// Score a product against AI recommendations
function scoreProduct(
  product: Product,
  recommendation: ProductRecommendation,
  hairType: string,
  concerns: string[]
): number {
  let score = 0;

  // Ingredient match (up to 40 points)
  const productIngredients = product.key_ingredients.map((i) =>
    i.toLowerCase()
  );
  const recIngredients = recommendation.key_ingredients.map((i) =>
    i.toLowerCase()
  );
  const ingredientMatches = recIngredients.filter((ing) =>
    productIngredients.some(
      (pi) => pi.includes(ing) || ing.includes(pi)
    )
  );
  score += (ingredientMatches.length / Math.max(recIngredients.length, 1)) * 40;

  // Hair type match (up to 30 points)
  const normalizedHairType = hairType.toLowerCase();
  const hairTypeMatch = product.hair_types.some(
    (ht) =>
      ht.toLowerCase().includes(normalizedHairType) ||
      normalizedHairType.includes(ht.toLowerCase())
  );
  if (hairTypeMatch) score += 30;
  else if (product.hair_types.includes("all")) score += 20;

  // Concerns match (up to 20 points)
  const concernMatches = concerns.filter((c) =>
    product.concerns.some(
      (pc) => pc.toLowerCase().includes(c.toLowerCase())
    )
  );
  score += (concernMatches.length / Math.max(concerns.length, 1)) * 20;

  // Rating bonus (up to 10 points)
  score += (product.rating / 5) * 10;

  return Math.round(score);
}

function getMatchReason(
  product: Product,
  recommendation: ProductRecommendation
): string {
  const productIngredients = product.key_ingredients.map((i) =>
    i.toLowerCase()
  );
  const recIngredients = recommendation.key_ingredients.map((i) =>
    i.toLowerCase()
  );
  const matches = recIngredients.filter((ing) =>
    productIngredients.some(
      (pi) => pi.includes(ing) || ing.includes(pi)
    )
  );

  if (matches.length > 0) {
    return `Contains ${matches.slice(0, 2).join(" and ")} as recommended`;
  }
  return recommendation.what_to_look_for.slice(0, 80);
}

export async function matchProducts(
  productRecommendations: ProductRecommendation[],
  hairType: string,
  concerns: string[]
): Promise<Record<string, MatchedProduct[]>> {
  const serverClient = createServerClient();

  // Fetch all active products
  const { data: products, error } = await serverClient
    .from("products")
    .select("*")
    .eq("is_active", true);

  if (error) throw error;
  if (!products) return {};

  const result: Record<string, MatchedProduct[]> = {};

  for (const rec of productRecommendations) {
    const category = rec.category.toLowerCase();

    // Filter products by category
    const categoryProducts = products.filter(
      (p: Product) => p.category.toLowerCase() === category
    );

    // Score and sort
    const scored: MatchedProduct[] = categoryProducts.map((p: Product) => ({
      ...p,
      match_score: scoreProduct(p, rec, hairType, concerns),
      match_reason: getMatchReason(p, rec),
    }));

    scored.sort((a, b) => b.match_score - a.match_score);

    result[category] = scored.slice(0, 3);
  }

  return result;
}

// ============================================================
// Seed Data (20 sample products)
// ============================================================

export const SEED_PRODUCTS: Omit<Product, "id" | "created_at" | "updated_at">[] = [
  {
    name: "SheaMoisture Raw Shea Butter Moisture Retention Shampoo",
    brand: "SheaMoisture",
    category: "shampoo",
    subcategory: "moisturizing",
    description: "Deeply moisturizes and retains moisture for softer hair",
    image_url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
    affiliate_url: "https://amzn.to/example1",
    affiliate_network: "Amazon Associates",
    price: 12.99,
    rating: 4.6,
    hair_types: ["curly", "coily", "wavy"],
    concerns: ["dryness", "damage", "frizz"],
    key_ingredients: ["raw shea butter", "argan oil", "sea kelp"],
    is_active: true,
  },
  {
    name: "Olaplex No. 4 Bond Maintenance Shampoo",
    brand: "Olaplex",
    category: "shampoo",
    subcategory: "repair",
    description: "Repairs broken bonds and strengthens hair from within",
    image_url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400",
    affiliate_url: "https://amzn.to/example2",
    affiliate_network: "Amazon Associates",
    price: 30.00,
    rating: 4.8,
    hair_types: ["straight", "wavy", "curly", "all"],
    concerns: ["damage", "thinning"],
    key_ingredients: ["bis-aminopropyl diglycol dimaleate", "panthenol"],
    is_active: true,
  },
  {
    name: "Briogeo Scalp Revival Charcoal + Coconut Oil Micro-Exfoliating Shampoo",
    brand: "Briogeo",
    category: "shampoo",
    subcategory: "clarifying",
    description: "Gently exfoliates scalp while nourishing hair",
    image_url: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400",
    affiliate_url: "https://amzn.to/example3",
    affiliate_network: "Amazon Associates",
    price: 42.00,
    rating: 4.5,
    hair_types: ["all"],
    concerns: ["oiliness", "dandruff"],
    key_ingredients: ["activated charcoal", "coconut oil", "tea tree oil"],
    is_active: true,
  },
  {
    name: "Paul Mitchell Tea Tree Special Shampoo",
    brand: "Paul Mitchell",
    category: "shampoo",
    subcategory: "balancing",
    description: "Invigorating cleanser that balances scalp moisture",
    image_url: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400",
    affiliate_url: "https://amzn.to/example4",
    affiliate_network: "Amazon Associates",
    price: 14.00,
    rating: 4.7,
    hair_types: ["straight", "wavy"],
    concerns: ["oiliness", "dandruff"],
    key_ingredients: ["tea tree oil", "peppermint", "lavender"],
    is_active: true,
  },
  {
    name: "Moroccanoil Moisture Repair Conditioner",
    brand: "Moroccanoil",
    category: "conditioner",
    subcategory: "repair",
    description: "Reconstructs and detangles damaged hair with argan oil",
    image_url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400",
    affiliate_url: "https://amzn.to/example5",
    affiliate_network: "Amazon Associates",
    price: 34.00,
    rating: 4.7,
    hair_types: ["wavy", "curly", "straight"],
    concerns: ["damage", "dryness", "frizz"],
    key_ingredients: ["argan oil", "keratin", "amino acids"],
    is_active: true,
  },
  {
    name: "Cantu Shea Butter Leave-In Conditioning Repair Cream",
    brand: "Cantu",
    category: "conditioner",
    subcategory: "leave-in",
    description: "Deeply moisturizing leave-in for natural hair textures",
    image_url: "https://images.unsplash.com/photo-1600428853876-fb7a72c2e28b?w=400",
    affiliate_url: "https://amzn.to/example6",
    affiliate_network: "Amazon Associates",
    price: 8.97,
    rating: 4.6,
    hair_types: ["curly", "coily"],
    concerns: ["dryness", "frizz", "damage"],
    key_ingredients: ["shea butter", "coconut oil", "honey"],
    is_active: true,
  },
  {
    name: "Kiehl's Olive Fruit Oil Deeply Repairative Hair Pak",
    brand: "Kiehl's",
    category: "conditioner",
    subcategory: "deep treatment",
    description: "Weekly deep conditioning mask for dry, damaged hair",
    image_url: "https://images.unsplash.com/photo-1593113630400-ea4288922559?w=400",
    affiliate_url: "https://amzn.to/example7",
    affiliate_network: "Amazon Associates",
    price: 52.00,
    rating: 4.5,
    hair_types: ["all"],
    concerns: ["damage", "dryness"],
    key_ingredients: ["olive oil", "avocado oil", "lemon oil"],
    is_active: true,
  },
  {
    name: "Bumble and Bumble Hairdresser's Invisible Oil Primer",
    brand: "Bumble and Bumble",
    category: "styling",
    subcategory: "primer",
    description: "Weightless heat protection and frizz control",
    image_url: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400",
    affiliate_url: "https://amzn.to/example8",
    affiliate_network: "Amazon Associates",
    price: 35.00,
    rating: 4.7,
    hair_types: ["straight", "wavy"],
    concerns: ["frizz", "damage"],
    key_ingredients: ["baobab oil", "maracuja oil", "grape seed oil"],
    is_active: true,
  },
  {
    name: "Ouai Wave Spray",
    brand: "Ouai",
    category: "styling",
    subcategory: "texture spray",
    description: "Enhances natural wave pattern with beachy texture",
    image_url: "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400",
    affiliate_url: "https://amzn.to/example9",
    affiliate_network: "Amazon Associates",
    price: 30.00,
    rating: 4.4,
    hair_types: ["wavy", "straight"],
    concerns: [],
    key_ingredients: ["rice protein", "sea salt", "cashmere protein"],
    is_active: true,
  },
  {
    name: "Eco Styler Olive Oil Styling Gel",
    brand: "Eco Styler",
    category: "styling",
    subcategory: "gel",
    description: "Strong hold gel with nourishing olive oil",
    image_url: "https://images.unsplash.com/photo-1614345167851-2bbb19c25e93?w=400",
    affiliate_url: "https://amzn.to/example10",
    affiliate_network: "Amazon Associates",
    price: 7.99,
    rating: 4.5,
    hair_types: ["curly", "coily"],
    concerns: ["frizz"],
    key_ingredients: ["olive oil", "carbomer", "panthenol"],
    is_active: true,
  },
  {
    name: "TIGI Bed Head Self Absorbed Mega Vitamin Conditioner",
    brand: "TIGI",
    category: "styling",
    subcategory: "cream",
    description: "Vitamin-enriched styling cream for shine and control",
    image_url: "https://images.unsplash.com/photo-1561500100-86df7a0c1df2?w=400",
    affiliate_url: "https://amzn.to/example11",
    affiliate_network: "Amazon Associates",
    price: 18.50,
    rating: 4.3,
    hair_types: ["all"],
    concerns: ["frizz", "dryness"],
    key_ingredients: ["vitamin B5", "vitamin E", "pro-vitamin"],
    is_active: true,
  },
  {
    name: "Olaplex No. 3 Hair Perfector",
    brand: "Olaplex",
    category: "treatment",
    subcategory: "bond repair",
    description: "At-home bond-building treatment to strengthen hair",
    image_url: "https://images.unsplash.com/photo-1617897903246-719242758050?w=400",
    affiliate_url: "https://amzn.to/example12",
    affiliate_network: "Amazon Associates",
    price: 28.00,
    rating: 4.8,
    hair_types: ["all"],
    concerns: ["damage", "thinning"],
    key_ingredients: ["bis-aminopropyl diglycol dimaleate"],
    is_active: true,
  },
  {
    name: "Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil",
    brand: "Mielle Organics",
    category: "treatment",
    subcategory: "scalp oil",
    description: "Stimulates scalp and strengthens hair follicles",
    image_url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400",
    affiliate_url: "https://amzn.to/example13",
    affiliate_network: "Amazon Associates",
    price: 10.99,
    rating: 4.6,
    hair_types: ["curly", "coily", "all"],
    concerns: ["thinning", "damage"],
    key_ingredients: ["rosemary oil", "mint oil", "biotin"],
    is_active: true,
  },
  {
    name: "Briogeo B. Well 100% Organic Virgin Marula + Tea Tree Scalp Treatment",
    brand: "Briogeo",
    category: "treatment",
    subcategory: "scalp treatment",
    description: "Nourishes and balances scalp for healthier hair growth",
    image_url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
    affiliate_url: "https://amzn.to/example14",
    affiliate_network: "Amazon Associates",
    price: 38.00,
    rating: 4.4,
    hair_types: ["all"],
    concerns: ["dandruff", "oiliness"],
    key_ingredients: ["marula oil", "tea tree oil", "peppermint"],
    is_active: true,
  },
  {
    name: "Redken Extreme Anti-Snap Leave-In Treatment",
    brand: "Redken",
    category: "treatment",
    subcategory: "strengthening",
    description: "Prevents breakage and strengthens weak, brittle hair",
    image_url: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400",
    affiliate_url: "https://amzn.to/example15",
    affiliate_network: "Amazon Associates",
    price: 23.00,
    rating: 4.5,
    hair_types: ["all"],
    concerns: ["damage", "thinning"],
    key_ingredients: ["protein complex", "ceramides", "amino acids"],
    is_active: true,
  },
  {
    name: "Dyson Airwrap Multi-Styler",
    brand: "Dyson",
    category: "tool",
    subcategory: "styler",
    description: "Revolutionary styling tool that uses airflow to style without extreme heat",
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400",
    affiliate_url: "https://amzn.to/example16",
    affiliate_network: "Amazon Associates",
    price: 599.99,
    rating: 4.7,
    hair_types: ["straight", "wavy", "curly"],
    concerns: ["damage", "frizz"],
    key_ingredients: [],
    is_active: true,
  },
  {
    name: "Wet Brush Original Detangler",
    brand: "Wet Brush",
    category: "tool",
    subcategory: "brush",
    description: "Detangles hair effortlessly without breakage",
    image_url: "https://images.unsplash.com/photo-1587466280419-21f29b5d7062?w=400",
    affiliate_url: "https://amzn.to/example17",
    affiliate_network: "Amazon Associates",
    price: 10.99,
    rating: 4.8,
    hair_types: ["all"],
    concerns: ["damage"],
    key_ingredients: [],
    is_active: true,
  },
  {
    name: "GHD Platinum+ Professional Performance Hair Straightener",
    brand: "GHD",
    category: "tool",
    subcategory: "straightener",
    description: "Smart heat technology for optimal styling temperature",
    image_url: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400",
    affiliate_url: "https://amzn.to/example18",
    affiliate_network: "Amazon Associates",
    price: 249.00,
    rating: 4.7,
    hair_types: ["straight", "wavy"],
    concerns: ["frizz"],
    key_ingredients: [],
    is_active: true,
  },
  {
    name: "DevaCurl One Condition Original Daily Cream Conditioner",
    brand: "DevaCurl",
    category: "conditioner",
    subcategory: "daily",
    description: "Daily moisture for defining and softening curls",
    image_url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400",
    affiliate_url: "https://amzn.to/example19",
    affiliate_network: "Amazon Associates",
    price: 26.00,
    rating: 4.5,
    hair_types: ["curly", "coily"],
    concerns: ["dryness", "frizz"],
    key_ingredients: ["botanical extracts", "grape seed oil", "vitamin E"],
    is_active: true,
  },
  {
    name: "Schwarzkopf Professional BC Bonacure Volume Boost Shampoo",
    brand: "Schwarzkopf Professional",
    category: "shampoo",
    subcategory: "volumizing",
    description: "Lightweight formula for fine, flat hair with maximum volume",
    image_url: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400",
    affiliate_url: "https://amzn.to/example20",
    affiliate_network: "Amazon Associates",
    price: 19.00,
    rating: 4.3,
    hair_types: ["straight", "wavy"],
    concerns: ["thinning"],
    key_ingredients: ["wheat protein", "provitamin B5", "creatine"],
    is_active: true,
  },
];
