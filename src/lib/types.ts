// ============================================================
// Core Analysis Types
// ============================================================

export interface FaceAnalysis {
  shape: "oval" | "round" | "square" | "heart" | "oblong" | "diamond";
  confidence: number;
  notable_features: string[];
}

export interface HairAnalysis {
  type: string;
  texture: string;
  density: "thin" | "medium" | "thick";
  condition: "healthy" | "slightly damaged" | "damaged" | "severely damaged";
  current_style: string;
}

export interface StyleRecommendation {
  style_name: string;
  description: string;
  why_it_works: string;
  maintenance_level: "low" | "medium" | "high";
  barber_instructions: string;
  search_keywords: string[];
}

export interface ProductRecommendation {
  category: string;
  what_to_look_for: string;
  key_ingredients: string[];
  avoid_ingredients: string[];
  usage_tip: string;
}

export interface AnalysisResult {
  face_analysis: FaceAnalysis;
  hair_analysis: HairAnalysis;
  recommendations: StyleRecommendation[];
  product_recommendations: ProductRecommendation[];
  summary?: string;
}

// ============================================================
// Onboarding / Form Types
// ============================================================

export type HairType = "straight" | "wavy" | "curly" | "coily";
export type MaintenanceLevel = "low" | "medium" | "high";
export type StyleVibe =
  | "professional"
  | "casual"
  | "edgy"
  | "classic"
  | "trendy";

export interface HairConcerns {
  frizz: boolean;
  thinning: boolean;
  dryness: boolean;
  oiliness: boolean;
  dandruff: boolean;
  damage: boolean;
}

export interface OnboardingData {
  photos: CapturedPhoto[];
  textDescription: string;
  hairType: HairType | "";
  currentLength: number; // 1-10 slider
  concerns: HairConcerns;
  maintenanceLevel: MaintenanceLevel | "";
  styleVibe: StyleVibe | "";
  constraints: string;
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  angle: "front" | "side" | "back" | "other";
  file?: File;
}

// ============================================================
// Database Types
// ============================================================

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  hair_profile_json: AnalysisResult | null;
  location_city: string | null;
  created_at: string;
}

export interface Analysis {
  id: string;
  user_id: string;
  photos: string[];
  text_input: string;
  ai_response_json: AnalysisResult;
  onboarding_data: Partial<OnboardingData>;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  subcategory: string | null;
  description: string;
  image_url: string;
  affiliate_url: string;
  affiliate_network: string;
  price: number;
  rating: number;
  hair_types: string[];
  concerns: string[];
  key_ingredients: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductCategory =
  | "shampoo"
  | "conditioner"
  | "styling"
  | "treatment"
  | "tool";

export interface MatchedProduct extends Product {
  match_score: number;
  match_reason: string;
}

export interface ClickEvent {
  id: string;
  product_id: string;
  user_id: string | null;
  session_id: string;
  timestamp: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  photo_url: string;
  notes: string | null;
  date: string;
  created_at: string;
}

// Community (scaffold only)
export interface CommunityPost {
  id: string;
  user_id: string;
  before_photo: string;
  after_photo: string;
  style_name: string;
  caption: string | null;
  likes_count: number;
  created_at: string;
}

// ============================================================
// API Request/Response Types
// ============================================================

export interface AnalyzeRequest {
  photos: string[]; // base64 encoded
  textDescription: string;
  onboardingData: Partial<OnboardingData>;
}

export interface AnalyzeResponse {
  success: boolean;
  analysisId?: string;
  result?: AnalysisResult;
  error?: string;
}

export interface MatchProductsRequest {
  productRecommendations: ProductRecommendation[];
  hairType: string;
  concerns: string[];
}

export interface MatchProductsResponse {
  success: boolean;
  products?: Record<string, MatchedProduct[]>;
  error?: string;
}

export interface ClickTrackRequest {
  productId: string;
  sessionId: string;
}

// ============================================================
// Seasonal Tips
// ============================================================

export interface SeasonalTip {
  season: "winter" | "spring" | "summer" | "fall";
  climate: "humid" | "dry" | "moderate" | "tropical";
  tip: string;
  emoji: string;
}

// ============================================================
// UI State Types
// ============================================================

export type OnboardingStep = 1 | 2 | 3;

export interface OnboardingState {
  step: OnboardingStep;
  data: OnboardingData;
  isSubmitting: boolean;
  error: string | null;
}
