export const categories = [
  "Apparel & Clothing",
  "Footwear",
  "Equipment",
  "Fitness & Gym Gear",
  "Accessories",
  "Team Merchandise",
  "Outdoor Sports Gear",
  "Kid's Sportswear & Gear",
];
export const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
export const colors = [
  { name: "Navy", class: "bg-[#0F172A]" },
  { name: "Yellow", class: "bg-[#FCD34D]" },
  { name: "White", class: "bg-white border" },
  { name: "Orange", class: "bg-[#FB923C]" },
  { name: "Green", class: "bg-[#22C55E]" },
  { name: "Pink", class: "bg-[#EC4899]" },
  { name: "Cyan", class: "bg-[#06B6D4]" },
  { name: "Blue", class: "bg-[#3B82F6]" },
];
export const brands = [
  "N/A",
  "Nike",
  "Adidas",
  "Puma",
  "Reebok",
  "Under Armour",
];

export const PUBLIC_DOMAIN =
  process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000";

/// Game Zone

type GAME = {
  name: string;
  id: string;
  link: string;
  apis: Record<string, string>;
};

const guessGame = {
  name: "Guess Game",
  link: "guess-number",
  id: "guess_the_number",
  apis: {
    guessChecker: "/guess",
    addScore: "/add-coin",
  } as const,
} satisfies GAME;

export const games = {
  guessGame,
} as const;

export const gameCommons = {
  getLeaderBoard: "/get-leaderboard",
  getCurrentSeason: "/get-season",
  getUserScore: "/get-score",
  getUserRank: "/get-user-rank",
} as const;
