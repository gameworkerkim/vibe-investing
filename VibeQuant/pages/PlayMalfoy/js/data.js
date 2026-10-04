/** Princess Maker-style monthly activities, closet, and ending rules. Ages 21+ AU only. */
export const MONTHS = 36;
export const START = { year: 2001, month: 6 };

export const STATS = ["stamina", "magic", "pride", "grace", "charm", "intellect", "morality", "bond"];

export const ACTIVITIES = [
  { id: "etiquette", cost: 35, gold: 0, stress: 4, stamina: -8, magic: 0, pride: 4, grace: 10, charm: 6, intellect: 2, morality: 2, bond: 1 },
  { id: "wardrobe", cost: 55, gold: 0, stress: 3, stamina: -4, magic: 0, pride: 2, grace: 12, charm: 8, intellect: 0, morality: 0, bond: 1, gallery: "malfoy-2" },
  { id: "salon", cost: 45, gold: 0, stress: 6, stamina: -6, magic: 0, pride: 6, grace: 7, charm: 10, intellect: 1, morality: -1, bond: 0, gallery: "cg-ball" },
  { id: "potions", cost: 25, gold: 0, stress: 7, stamina: -7, magic: 8, pride: 1, grace: 0, charm: 0, intellect: 8, morality: 1, bond: 0 },
  { id: "library", cost: 10, gold: 0, stress: 5, stamina: -5, magic: 4, pride: -1, grace: 1, charm: 0, intellect: 10, morality: 3, bond: 1, gallery: "cg-library" },
  { id: "ministry", cost: 0, gold: 40, stress: 8, stamina: -10, magic: 1, pride: -4, grace: 1, charm: 2, intellect: 5, morality: 6, bond: 0 },
  { id: "duel", cost: 20, gold: 0, stress: 6, stamina: 6, magic: 9, pride: 7, grace: -4, charm: 1, intellect: 0, morality: -2, bond: 0 },
  { id: "pitch", cost: 15, gold: 0, stress: 3, stamina: 8, magic: 2, pride: 3, grace: -2, charm: 5, intellect: 0, morality: 0, bond: 1 },
  { id: "kitchen", cost: 12, gold: 0, stress: -4, stamina: 2, magic: 0, pride: -3, grace: 2, charm: 5, intellect: 0, morality: 2, bond: 4, gallery: "cg-tea" },
  { id: "talk", cost: 8, gold: 0, stress: -2, stamina: -2, magic: 0, pride: -2, grace: 2, charm: 3, intellect: 1, morality: 2, bond: 8, gallery: "cg-window" },
  { id: "rest", cost: 0, gold: 0, stress: -14, stamina: 12, magic: 0, pride: 0, grace: 0, charm: 0, intellect: 0, morality: 0, bond: 1 },
  { id: "dark", cost: 0, gold: 0, stress: 10, stamina: -6, magic: 10, pride: 8, grace: 1, charm: 2, intellect: 4, morality: -8, bond: -1 },
];

/** Wearable outfits. Gifting does not advance the month; wearing changes the portrait. */
export const CLOTHES = [
  { id: "robe", cost: 0, img: "img/malfoy-0.jpg", gallery: "malfoy-0", grace: 0, charm: 0, starter: true },
  { id: "waistcoat", cost: 42, img: "img/malfoy-1.jpg", gallery: "malfoy-1", grace: 5, charm: 4 },
  { id: "daydress", cost: 78, img: "img/malfoy-2.jpg", gallery: "malfoy-2", grace: 10, charm: 8 },
  { id: "teadress", cost: 64, img: "img/malfoy-2.jpg", gallery: "cg-tea", grace: 7, charm: 9 },
  { id: "ballgown", cost: 120, img: "img/malfoy-3.jpg", gallery: "malfoy-3", grace: 14, charm: 12 },
];

/** One-time beauty gifts. Do not change portrait by themselves. */
export const GIFTS = [
  { id: "earrings", cost: 36, img: "img/malfoy-1.jpg", gallery: "malfoy-1", grace: 4, charm: 6, pride: 2 },
  { id: "gloves", cost: 28, img: "img/malfoy-2.jpg", gallery: "malfoy-2", grace: 6, charm: 3 },
  { id: "makeup", cost: 48, img: "img/malfoy-3.jpg", gallery: "malfoy-3", grace: 8, charm: 10 },
  { id: "perfume", cost: 32, img: "img/cg-window.jpg", gallery: "cg-window", charm: 7, bond: 2 },
];

export const GALLERY = [
  { id: "malfoy-0", img: "img/malfoy-0.jpg", stage: 0 },
  { id: "malfoy-1", img: "img/malfoy-1.jpg", stage: 1 },
  { id: "malfoy-2", img: "img/malfoy-2.jpg", stage: 2 },
  { id: "malfoy-3", img: "img/malfoy-3.jpg", stage: 3 },
  { id: "cg-window", img: "img/cg-window.jpg" },
  { id: "cg-library", img: "img/cg-library.jpg" },
  { id: "cg-ball", img: "img/cg-ball.jpg" },
  { id: "cg-tea", img: "img/cg-tea.jpg" },
];

export const ENDING_LIST = [
  "collapse", "dark", "beauty", "loverHarry", "loverRon", "thesis",
  "ice", "ministry", "salon", "pitch", "professor", "couture", "friend", "ordinary",
];

export function clamp(n, a = 0, b = 999) {
  return Math.max(a, Math.min(b, n));
}

export function portraitStage(grace) {
  if (grace >= 75) return 3;
  if (grace >= 50) return 2;
  if (grace >= 25) return 1;
  return 0;
}

export function dateFromTurn(turn) {
  const m0 = START.month - 1 + turn;
  const year = START.year + Math.floor(m0 / 12);
  const month = (m0 % 12) + 1;
  return { year, month, age: 21 + Math.floor(turn / 12) };
}

export function migrate(s) {
  if (!s) return s;
  if (!Array.isArray(s.owned)) s.owned = ["robe"];
  if (!s.owned.includes("robe")) s.owned.unshift("robe");
  if (!s.worn) s.worn = "robe";
  if (!Array.isArray(s.gifts)) s.gifts = [];
  if (!Array.isArray(s.gallery)) s.gallery = ["malfoy-0"];
  if (!Array.isArray(s.log)) s.log = [];
  return s;
}

export function newState(pc) {
  return migrate({
    pc,
    turn: 0,
    gold: 120,
    stress: 18,
    collapsed: false,
    gallery: ["malfoy-0"],
    log: [],
    owned: ["robe"],
    worn: "robe",
    gifts: [],
    stamina: 58,
    magic: 62,
    pride: 78,
    grace: 12,
    charm: 38,
    intellect: 55,
    morality: 32,
    bond: 8,
  });
}

export function pickEnding(s) {
  const owned = s.owned || [];
  const gifts = s.gifts || [];
  if (s.collapsed || s.stamina <= 0) return "collapse";
  if (s.morality < 22 && s.magic >= 68 && s.pride >= 58) return "dark";
  if (gifts.includes("makeup") && s.grace >= 70 && (owned.includes("ballgown") || owned.includes("daydress"))) {
    return "beauty";
  }
  if (s.pc !== "hermione" && s.bond >= 78 && (s.grace >= 52 || s.charm >= 60)) {
    return s.pc === "harry" ? "loverHarry" : "loverRon";
  }
  if (s.pc === "hermione" && s.bond >= 70 && s.intellect >= 68) return "thesis";
  if (s.grace >= 78 && s.pride >= 68 && s.bond < 42) return "ice";
  if (s.intellect >= 72 && s.morality >= 58) return "ministry";
  if (s.grace >= 68 && s.charm >= 68) return "salon";
  if (s.stamina >= 72 && s.charm >= 52) return "pitch";
  if (s.intellect >= 78 && s.magic >= 68) return "professor";
  if (owned.length >= 4 && s.charm >= 55 && s.grace >= 50) return "couture";
  if (s.bond >= 58) return "friend";
  return "ordinary";
}
