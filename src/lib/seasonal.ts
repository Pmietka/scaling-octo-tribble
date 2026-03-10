import type { SeasonalTip } from "./types";

// Climate lookup by US city (simplified)
const CITY_CLIMATE: Record<string, string> = {
  // Cold/Dry
  chicago: "dry",
  minneapolis: "dry",
  detroit: "dry",
  denver: "dry",
  salt_lake_city: "dry",
  // Cold/Humid
  new_york: "moderate",
  boston: "moderate",
  philadelphia: "moderate",
  seattle: "humid",
  portland: "humid",
  // Hot/Humid
  miami: "tropical",
  new_orleans: "tropical",
  houston: "tropical",
  orlando: "tropical",
  tampa: "tropical",
  atlanta: "humid",
  // Hot/Dry
  los_angeles: "dry",
  phoenix: "dry",
  las_vegas: "dry",
  san_diego: "dry",
  // Moderate
  san_francisco: "moderate",
  nashville: "moderate",
  charlotte: "moderate",
  dallas: "moderate",
};

function getSeason(month: number): "winter" | "spring" | "summer" | "fall" {
  if (month >= 12 || month <= 2) return "winter";
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  return "fall";
}

function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z_]/g, "");
}

function getClimate(city: string): string {
  const normalized = normalizeCity(city);
  for (const [key, value] of Object.entries(CITY_CLIMATE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  return "moderate"; // default
}

const TIPS: Record<string, Record<string, SeasonalTip>> = {
  winter: {
    dry: {
      season: "winter",
      climate: "dry",
      emoji: "❄️",
      tip: "Cold, dry winters can strip moisture from your hair. Add a weekly deep conditioning mask and consider a humidifier at home. A leave-in conditioner before heading outside will protect against breakage from cold air.",
    },
    humid: {
      season: "winter",
      climate: "humid",
      emoji: "🌧️",
      tip: "Winter rain and humidity can create frizz. Use anti-frizz serum or oil on damp hair before styling. A clarifying shampoo once a month prevents product buildup from heavier winter formulas.",
    },
    moderate: {
      season: "winter",
      climate: "moderate",
      emoji: "🧣",
      tip: "Winter weather means more hat-wearing, which can flatten your hair. Try dry shampoo at the roots when removing hats, and choose a satin-lined beanie to prevent friction and breakage.",
    },
    tropical: {
      season: "winter",
      climate: "tropical",
      emoji: "🌺",
      tip: "Your tropical winter keeps humidity high year-round. Lightweight, water-based products will keep your hair from feeling heavy. An anti-humidity spray is your best friend for any outdoor plans.",
    },
  },
  spring: {
    dry: {
      season: "spring",
      climate: "dry",
      emoji: "🌸",
      tip: "Spring brings wind and pollen, which can dry out and cling to hair. Rinse your hair more frequently and use a light serum to protect against wind damage. A clarifying shampoo weekly removes pollen buildup.",
    },
    humid: {
      season: "spring",
      climate: "humid",
      emoji: "🌿",
      tip: "Spring showers bring frizz season. Swap to a heavier conditioner and reduce heat styling. A diffuser on low heat enhances your natural texture while minimizing frizz.",
    },
    moderate: {
      season: "spring",
      climate: "moderate",
      emoji: "🌷",
      tip: "Spring is a great time to refresh your hair routine. Book a trim to remove winter damage, and consider lighter styling products now that heavy winter conditions have passed.",
    },
    tropical: {
      season: "spring",
      climate: "tropical",
      emoji: "🌴",
      tip: "Tropical spring heat means more sweat and humidity. A scalp-focused routine keeps buildup at bay. Braids and updos keep hair off your neck and prevent moisture-related issues.",
    },
  },
  summer: {
    dry: {
      season: "summer",
      climate: "dry",
      emoji: "☀️",
      tip: "Hot, dry summers are hard on hair. Always apply UV-protecting hair products before going outside, and rinse with cool water after swimming pools. Deep condition weekly to restore moisture lost to the sun.",
    },
    humid: {
      season: "summer",
      climate: "humid",
      emoji: "💧",
      tip: "Summer humidity can make curls pop but also cause frizz. A strong hold gel or curl cream applied to soaking wet hair locks in definition. Microfiber towels or cotton t-shirts prevent frizz when drying.",
    },
    moderate: {
      season: "summer",
      climate: "moderate",
      emoji: "🌊",
      tip: "Summer is the perfect time to embrace your natural texture. If you swim often, wet your hair with fresh water before entering the pool to reduce chlorine absorption. A clarifying shampoo every two weeks removes mineral buildup.",
    },
    tropical: {
      season: "summer",
      climate: "tropical",
      emoji: "🏖️",
      tip: "Your tropical summer calls for maximum hydration. Use a coconut oil pre-wash treatment once a week to protect against humidity and salt water. Protective styles like braids or twists are low-maintenance and help preserve moisture.",
    },
  },
  fall: {
    dry: {
      season: "fall",
      climate: "dry",
      emoji: "🍂",
      tip: "As temperatures drop and indoor heating turns on, static becomes a real issue. A lightweight hair oil on the ends prevents flyaways. Consider switching to a richer conditioner as you head into the cooler months.",
    },
    humid: {
      season: "fall",
      climate: "humid",
      emoji: "🍃",
      tip: "Fall rain keeps humidity around longer than you might expect. Transitioning to a protective style for the season is smart. Stock up on your favorite anti-frizz products before winter shortages.",
    },
    moderate: {
      season: "fall",
      climate: "moderate",
      emoji: "🍁",
      tip: "Fall is a great time for a hair color refresh before winter. The cooler temperatures reduce scalp sweat, so you can go a bit longer between washes. Start incorporating a weekly moisturizing mask into your routine.",
    },
    tropical: {
      season: "fall",
      climate: "tropical",
      emoji: "🌿",
      tip: "Even in tropical climates, fall is a good reset time. Do a deep protein treatment to strengthen hair after summer sun exposure. A scalp exfoliation session removes buildup and prepares hair for continued healthy growth.",
    },
  },
};

export function getSeasonalTip(city: string): SeasonalTip | null {
  if (!city) return null;

  const now = new Date();
  const month = now.getMonth() + 1;
  const season = getSeason(month);
  const climate = getClimate(city);

  return TIPS[season]?.[climate] || TIPS[season]?.["moderate"] || null;
}
