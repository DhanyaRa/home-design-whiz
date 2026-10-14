export type RoomType = "Bedroom" | "Living room" | "Kitchen" | "Study / home office" | "Dining room" | "Other";

export type RoomAnswers = {
  room: RoomType;
  ownership: string;
  width: string;
  length: string;
  unit: "m" | "ft";
  keep: string;
  remove: string;
  ageGroup: string;
  role: string;
  people: string;
  household: string;
  accessibility: string;
  activities: string[];
  deskNeeds: string[];
  styles: string[];
  colors: string[];
  avoidColors: string;
  materials: string[];
  atmosphere: string;
  furnitureApproach: string;
  extraInstructions: string;
  budget: number;
  budgetIncludes: string[];
  makeoverPriority: string;
  buyingApproach: string;
  futureNeeds: string[];
  safety: string[];
  otherFuture: string;
};

export type Recommendation = {
  category: string;
  name: string;
  price: number;
  alternative: string;
  alternativePrice: number;
  why: string;
  action: "Purchase" | "Retain / rearrange";
};

const activityDesk = ["Studying / online classes", "Working from home / video calls"].some((need) => need);

export function formatINR(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function roomArea(answers: Pick<RoomAnswers, "width" | "length" | "unit">) {
  const width = Number(answers.width);
  const length = Number(answers.length);
  if (!Number.isFinite(width * length) || width <= 0 || length <= 0) return "—";
  const area = width * length * (answers.unit === "ft" ? 0.092903 : 1);
  return `${area.toFixed(1)} m²`;
}

export function buildRecommendations(answers: RoomAnswers): Recommendation[] {
  const isBedroom = answers.room === "Bedroom";
  const isOffice = answers.room === "Study / home office" || answers.activities.some((item) => item.toLowerCase().includes("work from home") || item.toLowerCase().includes("studying"));
  const isKitchen = answers.room === "Kitchen" || answers.activities.some((item) => item.toLowerCase().includes("cooking"));
  const hasPets = answers.activities.includes("Pet-friendly requirements");
  const style = answers.styles[0] ?? "your chosen style";
  const colors = answers.colors.length ? answers.colors.join(" and ").toLowerCase() : "a balanced neutral palette";
  const materials = answers.materials.length ? answers.materials.join(" and ").toLowerCase() : "durable, easy-care finishes";
  const workspaceReason = isOffice ? "Your study/work needs call for a dependable, dedicated work surface." : "A compact surface adds flexible space without crowding the room.";
  const items: Recommendation[] = [
    {
      category: isOffice ? "WORKSPACE" : isKitchen ? "ORGANIZATION" : "STORAGE",
      name: isOffice ? "Compact study desk" : isKitchen ? "Modular kitchen organizer" : "Low, modular storage unit",
      price: isOffice ? 8_500 : isKitchen ? 3_200 : 6_500,
      alternative: isOffice ? "Fold-down wall desk" : isKitchen ? "Stackable storage baskets" : "Fabric storage cubes",
      alternativePrice: isOffice ? 4_200 : isKitchen ? 1_100 : 1_600,
      why: workspaceReason,
      action: "Purchase",
    },
    {
      category: "LIGHTING",
      name: isOffice ? "Adjustable task light" : "Warm layered lighting set",
      price: isOffice ? 2_400 : 3_500,
      alternative: "LED task / reading lamp",
      alternativePrice: 950,
      why: isOffice ? "Focused task lighting supports your study or video-call routine." : "Layered light supports the atmosphere you selected: ${answers.atmosphere || "calm and considered"}.",
      action: "Purchase",
    },
    {
      category: isBedroom ? "SLEEP" : answers.room === "Living room" ? "SEATING" : "FLEXIBLE FURNITURE",
      name: isBedroom ? "Breathable cotton bedding" : answers.room === "Living room" ? "Compact lounge chair" : "Space-saving accent chair",
      price: isBedroom ? 4_200 : 7_800,
      alternative: isBedroom ? "Cotton-blend bedding set" : "Stackable lightweight chair",
      alternativePrice: isBedroom ? 2_200 : 3_500,
      why: isBedroom ? `Comfort-first bedding in ${materials} suits your ${answers.ageGroup || "selected"} age range and everyday rest.` : `A ${style.toLowerCase()}-leaning piece in ${materials} makes room for ${answers.activities[0]?.toLowerCase() || "everyday use"}.`,
      action: "Purchase",
    },
    {
      category: "COLOR & TEXTURE",
      name: hasPets ? "Washable, pet-friendly rug" : `${style} accent textiles`,
      price: hasPets ? 4_800 : 3_800,
      alternative: hasPets ? "Small washable cotton mat" : "Cushion-cover refresh",
      alternativePrice: hasPets ? 1_800 : 1_200,
      why: `Bring in ${colors}; ${hasPets ? "a washable surface suits your pet-friendly preference" : "keep the material palette cohesive"}.`,
      action: "Purchase",
    },
    ...(isOffice ? [{ category: "ERGONOMICS", name: "Supportive adjustable chair", price: 7_500, alternative: "Height-support cushion", alternativePrice: 1_400, why: "A supportive seat complements the dedicated workspace you requested.", action: "Purchase" as const }] : []),
    ...(answers.activities.includes("Reading or hobbies") ? [{ category: "HOBBIES", name: "Reading corner floor lamp", price: 3_100, alternative: "Clip-on reading light", alternativePrice: 700, why: "A focused pool of light supports your reading and hobby time.", action: "Purchase" as const }] : []),
  ];

  if (answers.budgetIncludes.includes("Painting")) {
    items.push({ category: "PAINT", name: "Low-VOC paint refresh allowance", price: 6_000, alternative: "One-wall paint refresh", alternativePrice: 2_500, why: `A restrained paint update can bring your ${colors} preference into the room.`, action: "Purchase" });
  }

  if (answers.keep.trim()) {
    items.unshift({ category: "EXISTING PIECES", name: "Keep and rearrange selected furniture", price: 0, alternative: "Refresh hardware / finish", alternativePrice: 900, why: `You asked to retain: ${answers.keep.trim()}. Repositioning it first reduces unnecessary purchases.`, action: "Retain / rearrange" });
  }

  const spendingFactor = answers.makeoverPriority === "Essential changes only" ? 0.72 : answers.makeoverPriority === "Premium transformation" ? 1.18 : 1;
  const shortlist = items.map((item) => ({ ...item, price: Math.round(item.price * spendingFactor) }));
  let total = 0;
  return shortlist.filter((item) => {
    if (item.price === 0) return true;
    if (total + item.price > Math.max(0, answers.budget)) return false;
    total += item.price;
    return true;
  });
}

export function buildSafetyAdvice(answers: RoomAnswers) {
  const advice = ["Keep the route from the door clear, with furniture arranged to preserve a comfortable walking path.", "Use layered general and task lighting; check that switches and frequently used items are easy to reach."];
  const selected = answers.safety.join(" ").toLowerCase();
  const accessibility = answers.accessibility.trim();
  if (selected.includes("child") || answers.household === "With family") advice.push("Choose stable, rounded-edge furniture; anchor tall storage to the wall and keep small hazards out of reach.");
  if (selected.includes("elder") || accessibility || selected.includes("accessible")) advice.push(`Prioritize an unobstructed, well-lit route and reachable storage${accessibility ? `, mindful of: ${accessibility}` : ""}. Treat these as planning prompts, not a professional accessibility assessment.`);
  if (selected.includes("slip") || selected.includes("trip") || selected.includes("rug")) advice.push("Secure rug edges and keep loose cables out of walking paths to reduce trip hazards.");
  if (answers.futureNeeds.includes("Planning for pets") || answers.activities.includes("Pet-friendly requirements")) advice.push("Prefer washable surfaces and keep breakable décor and cords out of pets’ reach.");
  return advice;
}

export function buildDesignRationale(answers: RoomAnswers) {
  const userRole = answers.role ? `As a ${answers.role.toLowerCase()}` : "For your household";
  const activities = answers.activities.length ? answers.activities.join(", ").toLowerCase() : "your everyday routine";
  const style = answers.styles.length ? answers.styles.join(" and ") : "a flexible, balanced style";
  const future = answers.futureNeeds.length && !answers.futureNeeds.includes("No anticipated changes") ? ` The plan also leaves flexibility for ${answers.futureNeeds.join(", ").toLowerCase()}.` : "";
  return `${userRole}, this ${style} ${answers.room.toLowerCase()} plan prioritizes ${activities}, with selections capped at ${formatINR(answers.budget)}.${future}`;
}

export function hasWorkActivity(answers: RoomAnswers) {
  return activityDesk || answers.activities.some((item) => item.toLowerCase().includes("work from home") || item.toLowerCase().includes("studying"));
}