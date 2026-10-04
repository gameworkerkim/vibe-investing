/** Princess Maker-style monthly activities, closet, and ending rules. Ages 21+ AU only. */
export const MONTHS = 36;
export const START = { year: 2001, month: 6 };
export const VERSION = "1.1";

export function compactLevel(turn) {
  return Math.min(3, 1 + Math.floor((turn || 0) / 12));
}

export const STATS = ["stamina", "magic", "pride", "grace", "charm", "intellect", "morality", "bond"];

export const ACTIVITIES = [
  { id: "etiquette", cat: "study", cost: 35, gold: 0, stress: 4, stamina: -8, magic: 0, pride: 4, grace: 10, charm: 6, intellect: 2, morality: 2, bond: 1 },
  { id: "wardrobe", cat: "study", cost: 55, gold: 0, stress: 3, stamina: -4, magic: 0, pride: 2, grace: 12, charm: 8, intellect: 0, morality: 0, bond: 1, gallery: "malfoy-2" },
  { id: "potions", cat: "study", cost: 25, gold: 0, stress: 7, stamina: -7, magic: 8, pride: 1, grace: 0, charm: 0, intellect: 8, morality: 1, bond: 0 },
  { id: "library", cat: "study", cost: 10, gold: 0, stress: 5, stamina: -5, magic: 4, pride: -1, grace: 1, charm: 0, intellect: 10, morality: 3, bond: 1, gallery: "cg-library" },
  { id: "dark", cat: "study", cost: 0, gold: 0, stress: 10, stamina: -6, magic: 10, pride: 8, grace: 1, charm: 2, intellect: 4, morality: -8, bond: -1 },
  { id: "occlumency", cat: "study", cost: 48, gold: 0, stress: 6, stamina: -6, magic: 8, pride: 4, grace: 2, charm: 0, intellect: 7, morality: 1, bond: 0, minLevel: 2, gallery: "cg-library" },
  { id: "magichistory", cat: "study", cost: 28, gold: 0, stress: 4, stamina: -5, magic: 2, pride: -1, grace: 1, charm: 0, intellect: 11, morality: 4, bond: 1, minLevel: 2, gallery: "cg-library" },
  { id: "astronomy", cat: "study", cost: 32, gold: 0, stress: 3, stamina: -4, magic: 6, pride: 1, grace: 5, charm: 2, intellect: 8, morality: 1, bond: 0, minLevel: 2 },
  { id: "arithmancy", cat: "study", cost: 52, gold: 0, stress: 7, stamina: -7, magic: 7, pride: 2, grace: 1, charm: 0, intellect: 13, morality: 2, bond: 0, minLevel: 3, gallery: "cg-library" },
  { id: "healing", cat: "study", cost: 45, gold: 0, stress: 5, stamina: 4, magic: 8, pride: -2, grace: 2, charm: 1, intellect: 6, morality: 6, bond: 2, minLevel: 3 },
  { id: "rhetoric", cat: "study", cost: 50, gold: 0, stress: 6, stamina: -6, magic: 1, pride: 6, grace: 4, charm: 7, intellect: 9, morality: 2, bond: 1, minLevel: 3 },
  { id: "duel", cat: "train", cost: 20, gold: 0, stress: 6, stamina: 6, magic: 9, pride: 7, grace: -4, charm: 1, intellect: 0, morality: -2, bond: 0 },
  { id: "pitch", cat: "train", cost: 15, gold: 0, stress: 3, stamina: 8, magic: 2, pride: 3, grace: -2, charm: 5, intellect: 0, morality: 0, bond: 1 },
  { id: "apprentice", cat: "train", cost: 40, gold: 0, stress: 6, stamina: -8, magic: 12, pride: 1, grace: 0, charm: 0, intellect: 3, morality: 1, bond: 0, gallery: "cg-apprentice" },
  { id: "patronus", cat: "train", cost: 42, gold: 0, stress: 5, stamina: -5, magic: 10, pride: -1, grace: 2, charm: 3, intellect: 2, morality: 6, bond: 3, minLevel: 2, gallery: "cg-apprentice" },
  { id: "apparate", cat: "train", cost: 38, gold: 0, stress: 8, stamina: 4, magic: 7, pride: 2, grace: -2, charm: 0, intellect: 2, morality: 0, bond: 0, minLevel: 2 },
  { id: "broom", cat: "train", cost: 22, gold: 0, stress: 3, stamina: 9, magic: 3, pride: 2, grace: 1, charm: 4, intellect: 0, morality: 0, bond: 1, minLevel: 2 },
  { id: "instructor", cat: "train", cost: 20, gold: 18, stress: 6, stamina: -4, magic: 8, pride: 5, grace: 1, charm: 3, intellect: 3, morality: 1, bond: 1, minLevel: 3, gallery: "cg-apprentice" },
  { id: "runes", cat: "train", cost: 55, gold: 0, stress: 7, stamina: -7, magic: 9, pride: 2, grace: 2, charm: 0, intellect: 10, morality: 1, bond: 0, minLevel: 3, gallery: "cg-library" },
  { id: "warding", cat: "train", cost: 48, gold: 0, stress: 6, stamina: -6, magic: 11, pride: 4, grace: 5, charm: 1, intellect: 4, morality: 2, bond: 0, minLevel: 3 },
  { id: "ministry", cat: "work", cost: 0, gold: 40, stress: 8, stamina: -10, magic: 1, pride: -4, grace: 1, charm: 2, intellect: 5, morality: 6, bond: 0 },
  { id: "kitchen", cat: "work", cost: 12, gold: 0, stress: -4, stamina: 2, magic: 0, pride: -3, grace: 2, charm: 5, intellect: 0, morality: 2, bond: 4, gallery: "cg-tea" },
  { id: "shop", cat: "work", cost: 0, gold: 34, stress: 6, stamina: -6, magic: 0, pride: -3, grace: 1, charm: 3, intellect: 2, morality: 2, bond: 0, gallery: "cg-shop" },
  { id: "owlpost", cat: "work", cost: 0, gold: 28, stress: 5, stamina: -8, magic: 1, pride: -2, grace: 0, charm: 2, intellect: 1, morality: 2, bond: 1, minLevel: 2 },
  { id: "greenhouse", cat: "work", cost: 0, gold: 24, stress: 4, stamina: -5, magic: 3, pride: -2, grace: 3, charm: 1, intellect: 2, morality: 4, bond: 1, minLevel: 2 },
  { id: "scribe", cat: "work", cost: 0, gold: 36, stress: 6, stamina: -7, magic: 0, pride: -1, grace: 1, charm: 0, intellect: 7, morality: 3, bond: 0, minLevel: 2, gallery: "cg-library" },
  { id: "auction", cat: "work", cost: 0, gold: 52, stress: 7, stamina: -6, magic: 2, pride: 4, grace: 3, charm: 6, intellect: 2, morality: -2, bond: 0, minLevel: 3, gallery: "cg-shop" },
  { id: "tutor", cat: "work", cost: 0, gold: 32, stress: 5, stamina: -6, magic: 2, pride: -5, grace: 1, charm: 2, intellect: 6, morality: 5, bond: 2, minLevel: 3 },
  { id: "curator", cat: "work", cost: 0, gold: 44, stress: 6, stamina: -7, magic: 3, pride: 1, grace: 5, charm: 3, intellect: 6, morality: 3, bond: 0, minLevel: 3, gallery: "cg-library" },
  { id: "salon", cat: "social", cost: 45, gold: 0, stress: 6, stamina: -6, magic: 0, pride: 6, grace: 7, charm: 10, intellect: 1, morality: -1, bond: 0, gallery: "cg-ball" },
  { id: "ball", cat: "social", cost: 55, gold: 0, stress: 5, stamina: -5, magic: 0, pride: 3, grace: 9, charm: 10, intellect: 1, morality: 0, bond: 2, gallery: "cg-ball" },
  { id: "datePrince", cat: "social", cost: 80, gold: 0, stress: 5, stamina: -5, magic: 0, pride: 6, grace: 8, charm: 12, intellect: 1, morality: -1, bond: 1, minLevel: 2, gallery: "cg-ball" },
  { id: "dateHarry", cat: "social", cost: 40, gold: 0, stress: 3, stamina: -4, magic: 1, pride: -2, grace: 3, charm: 6, intellect: 1, morality: 3, bond: 10, gallery: "cg-window" },
  { id: "dateRon", cat: "social", cost: 36, gold: 0, stress: -2, stamina: -3, magic: 0, pride: -3, grace: 2, charm: 7, intellect: 0, morality: 2, bond: 10, gallery: "cg-tea" },
  { id: "dateHermione", cat: "social", cost: 38, gold: 0, stress: 2, stamina: -3, magic: 1, pride: -1, grace: 2, charm: 3, intellect: 6, morality: 3, bond: 7, gallery: "cg-library" },
  { id: "forest", cat: "adventure", cost: 10, gold: 0, stress: 7, stamina: -9, magic: 5, pride: 2, grace: 0, charm: 1, intellect: 2, morality: -1, bond: 0, adventure: true, pool: "forest", gallery: "cg-forest" },
  { id: "knockturn", cat: "adventure", cost: 18, gold: 0, stress: 8, stamina: -8, magic: 4, pride: 3, grace: 0, charm: 2, intellect: 2, morality: -3, bond: 0, adventure: true, pool: "knockturn", gallery: "cg-shop" },
  { id: "hogsmeade", cat: "adventure", cost: 22, gold: 0, stress: 4, stamina: -5, magic: 1, pride: 1, grace: 2, charm: 5, intellect: 1, morality: 1, bond: 2, adventure: true, pool: "hogsmeade", gallery: "cg-tea" },
  { id: "lake", cat: "adventure", cost: 16, gold: 0, stress: 7, stamina: -10, magic: 6, pride: 1, grace: 2, charm: 1, intellect: 2, morality: 0, bond: 0, adventure: true, pool: "lake", gallery: "cg-forest" },
  { id: "rest", cat: "rest", cost: 0, gold: 0, stress: -14, stamina: 12, magic: 0, pride: 0, grace: 0, charm: 0, intellect: 0, morality: 0, bond: 1 },
  { id: "talk", cat: "rest", cost: 8, gold: 0, stress: -2, stamina: -2, magic: 0, pride: -2, grace: 2, charm: 3, intellect: 1, morality: 2, bond: 8, gallery: "cg-window" },
  { id: "therapy", cat: "rest", cost: 28, gold: 0, stress: -18, stamina: 4, magic: 0, pride: -3, grace: 1, charm: 0, intellect: 3, morality: 4, bond: 3, gallery: "cg-window" },
];

/** Princess Maker 2-style menu categories. */
export const CATEGORIES = [
  { id: "study", icon: "◈" },
  { id: "train", icon: "✦" },
  { id: "work", icon: "●" },
  { id: "social", icon: "❖" },
  { id: "adventure", icon: "✧" },
  { id: "rest", icon: "☾" },
];

/** Random adventure outcomes, keyed by activity pool. */
export const ADVENTURE_POOLS = {
  forest: [
    { key: "advUnicorn", img: "img/cg-forest-unicorn.jpg", gal: "cg-forest-unicorn", d: { magic: 3, morality: 3, grace: 2 } },
    { key: "advThestral", img: "img/cg-forest-thestral.jpg", gal: "cg-forest-thestral", d: { magic: 4, intellect: 3, morality: 1 } },
    { key: "advVenom", img: "img/cg-forest-venom.jpg", gal: "cg-forest-venom", d: { magic: 5, morality: -4, stress: 6 } },
    { key: "advTreasure", img: "img/cg-forest-treasure.jpg", gal: "cg-forest-treasure", d: { gold: 40, charm: 2, pride: 1 } },
  ],
  knockturn: [
    { key: "advNightMarket", img: "img/cg-shop.jpg", gal: "cg-shop", d: { gold: 22, charm: 2, morality: -2 } },
    { key: "advCursedRelic", img: "img/cg-library.jpg", gal: "cg-library", d: { magic: 7, morality: -3, stress: 5 } },
    { key: "advBorginDeal", img: "img/malfoy-0.jpg", d: { gold: 48, pride: 3, morality: -4 } },
    { key: "advAlleyEscape", img: "img/cg-forest-venom.jpg", gal: "cg-forest-venom", d: { intellect: 4, stamina: -3, stress: 3 } },
  ],
  hogsmeade: [
    { key: "advThreeBroom", img: "img/cg-tea.jpg", gal: "cg-tea", d: { stress: -6, charm: 3, bond: 2 } },
    { key: "advHoneydukes", img: "img/cg-shop.jpg", gal: "cg-shop", d: { charm: 4, grace: 2, stress: -2 } },
    { key: "advSecretPassage", img: "img/cg-window.jpg", gal: "cg-window", d: { intellect: 4, magic: 2 } },
    { key: "advPubBrawl", img: "img/malfoy-1.jpg", d: { stamina: 4, pride: 3, morality: -2, stress: 5 } },
  ],
  lake: [
    { key: "advMermaid", img: "img/cg-forest-unicorn.jpg", gal: "cg-forest-unicorn", d: { magic: 5, grace: 3, charm: 2 } },
    { key: "advGrindylow", img: "img/cg-forest.jpg", gal: "cg-forest", d: { magic: 4, stamina: -5, stress: 5 } },
    { key: "advBlackPearl", img: "img/cg-forest-treasure.jpg", gal: "cg-forest-treasure", d: { gold: 28, intellect: 2 } },
    { key: "advColdDive", img: "img/cg-window.jpg", gal: "cg-window", d: { stamina: -4, morality: 2, stress: 3 } },
  ],
};

export const ADVENTURES = ADVENTURE_POOLS.forest;

/** Wearable outfits, modest → bold. Gifting does not advance the month. */
export const CLOTHES = [
  { id: "robe", cost: 0, img: "img/malfoy-0.jpg", gallery: "malfoy-0", grace: 0, charm: 0, starter: true, tone: "modest" },
  { id: "navy", cost: 38, img: "img/dress-navy.jpg", gallery: "dress-navy", grace: 4, charm: 3, morality: 2, tone: "modest" },
  { id: "wool", cost: 44, img: "img/dress-wool.jpg", gallery: "dress-wool", grace: 6, charm: 2, pride: 2, tone: "modest" },
  { id: "ivory", cost: 52, img: "img/dress-ivory.jpg", gallery: "dress-ivory", grace: 8, charm: 5, morality: 3, tone: "modest" },
  { id: "waistcoat", cost: 42, img: "img/malfoy-1.jpg", gallery: "malfoy-1", grace: 5, charm: 4, tone: "modest" },
  { id: "teadress", cost: 64, img: "img/malfoy-2.jpg", gallery: "cg-tea", grace: 7, charm: 9, tone: "mid" },
  { id: "daydress", cost: 78, img: "img/malfoy-2.jpg", gallery: "malfoy-2", grace: 10, charm: 8, tone: "mid" },
  { id: "riding", cost: 86, img: "img/dress-riding.jpg", gallery: "dress-riding", grace: 8, charm: 7, pride: 4, tone: "mid" },
  { id: "silver", cost: 98, img: "img/dress-silver.jpg", gallery: "dress-silver", grace: 12, charm: 11, tone: "mid" },
  { id: "ballgown", cost: 120, img: "img/malfoy-3.jpg", gallery: "malfoy-3", grace: 14, charm: 12, tone: "bold" },
  { id: "sequin", cost: 128, img: "img/dress-sequin.jpg", gallery: "dress-sequin", grace: 13, charm: 15, pride: 3, tone: "bold" },
  { id: "crimson", cost: 140, img: "img/dress-crimson.jpg", gallery: "dress-crimson", grace: 15, charm: 16, bond: 2, tone: "bold" },
  { id: "blackslit", cost: 155, img: "img/dress-blackslit.jpg", gallery: "dress-blackslit", grace: 12, charm: 18, morality: -3, tone: "bold" },
];

/** One-time accessories. Do not change portrait by themselves. */
export const GIFTS = [
  { id: "brooch", cost: 22, img: "img/dress-wool.jpg", gallery: "dress-wool", grace: 3, morality: 2, tone: "modest" },
  { id: "pearl", cost: 34, img: "img/dress-ivory.jpg", gallery: "dress-ivory", grace: 5, charm: 4, morality: 2, tone: "modest" },
  { id: "collar", cost: 26, img: "img/dress-navy.jpg", gallery: "dress-navy", grace: 4, intellect: 2, tone: "modest" },
  { id: "earrings", cost: 36, img: "img/malfoy-1.jpg", gallery: "malfoy-1", grace: 4, charm: 6, pride: 2, tone: "mid" },
  { id: "gloves", cost: 28, img: "img/malfoy-2.jpg", gallery: "malfoy-2", grace: 6, charm: 3, tone: "mid" },
  { id: "pins", cost: 30, img: "img/dress-silver.jpg", gallery: "dress-silver", grace: 5, charm: 5, tone: "mid" },
  { id: "makeup", cost: 48, img: "img/malfoy-3.jpg", gallery: "malfoy-3", grace: 8, charm: 10, tone: "bold" },
  { id: "perfume", cost: 32, img: "img/cg-window.jpg", gallery: "cg-window", charm: 7, bond: 2, tone: "mid" },
  { id: "fan", cost: 40, img: "img/dress-crimson.jpg", gallery: "dress-crimson", charm: 8, pride: 2, tone: "bold" },
  { id: "choker", cost: 46, img: "img/dress-blackslit.jpg", gallery: "dress-blackslit", charm: 9, grace: 3, morality: -1, tone: "bold" },
  { id: "diamond", cost: 70, img: "img/dress-sequin.jpg", gallery: "dress-sequin", charm: 12, grace: 6, pride: 3, tone: "bold" },
];

export const GOWNS = ["ballgown", "daydress", "silver", "sequin", "crimson", "blackslit"];

export const GALLERY = [
  { id: "malfoy-0", img: "img/malfoy-0.jpg", stage: 0 },
  { id: "malfoy-1", img: "img/malfoy-1.jpg", stage: 1 },
  { id: "malfoy-2", img: "img/malfoy-2.jpg", stage: 2 },
  { id: "malfoy-3", img: "img/malfoy-3.jpg", stage: 3 },
  { id: "dress-ivory", img: "img/dress-ivory.jpg" },
  { id: "dress-navy", img: "img/dress-navy.jpg" },
  { id: "dress-wool", img: "img/dress-wool.jpg" },
  { id: "dress-silver", img: "img/dress-silver.jpg" },
  { id: "dress-riding", img: "img/dress-riding.jpg" },
  { id: "dress-crimson", img: "img/dress-crimson.jpg" },
  { id: "dress-blackslit", img: "img/dress-blackslit.jpg" },
  { id: "dress-sequin", img: "img/dress-sequin.jpg" },
  { id: "cg-window", img: "img/cg-window.jpg" },
  { id: "cg-library", img: "img/cg-library.jpg" },
  { id: "cg-ball", img: "img/cg-ball.jpg" },
  { id: "cg-tea", img: "img/cg-tea.jpg" },
  { id: "cg-apprentice", img: "img/cg-apprentice.jpg" },
  { id: "cg-shop", img: "img/cg-shop.jpg" },
  { id: "cg-forest", img: "img/cg-forest.jpg" },
  { id: "cg-forest-unicorn", img: "img/cg-forest-unicorn.jpg" },
  { id: "cg-forest-thestral", img: "img/cg-forest-thestral.jpg" },
  { id: "cg-forest-venom", img: "img/cg-forest-venom.jpg" },
  { id: "cg-forest-treasure", img: "img/cg-forest-treasure.jpg" },
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
    gold: 180,
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
  if (gifts.includes("makeup") && s.grace >= 70 && GOWNS.some((id) => owned.includes(id))) {
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
  if (owned.length >= 6 && s.charm >= 55 && s.grace >= 50) return "couture";
  if (s.bond >= 58) return "friend";
  return "ordinary";
}
