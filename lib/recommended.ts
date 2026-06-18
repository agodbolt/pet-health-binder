// OWNER: paste your Amazon affiliate link into each `url`. Leave "" to hide a product.

export const AMAZON_DISCLOSURE =
  "As an Amazon Associate I earn from qualifying purchases.";

export type RecommendedSection =
  | "Emergency"
  | "Medications"
  | "Weight"
  | "Grooming"
  | "Travel & sitter";

export interface RecommendedProduct {
  id: string;
  section: RecommendedSection;
  name: string;
  blurb: string;
  url: string;
}

export const RECOMMENDED: RecommendedProduct[] = [
  {
    id: "first-aid-kit",
    section: "Emergency",
    name: "Pet first-aid kit",
    blurb: "Keep one by the door so you are ready the moment something goes wrong.",
    url: "",
  },
  {
    id: "gps-tracker",
    section: "Emergency",
    name: "GPS tracker / AirTag collar holder",
    blurb: "Find them fast if they slip out the gate or off the leash.",
    url: "",
  },
  {
    id: "pill-pockets",
    section: "Medications",
    name: "Pill pockets",
    blurb: "Tuck the pill inside a soft treat so they take it without a fight.",
    url: "",
  },
  {
    id: "calming-chews",
    section: "Medications",
    name: "Calming chews",
    blurb: "A little help for storms, fireworks, and anxious days.",
    url: "",
  },
  {
    id: "pet-scale",
    section: "Weight",
    name: "Pet scale",
    blurb: "Weigh them at home so the numbers you chart are actually accurate.",
    url: "",
  },
  {
    id: "nail-grinder",
    section: "Grooming",
    name: "Nail grinder or clippers",
    blurb: "Keep their nails short and comfortable between vet visits.",
    url: "",
  },
  {
    id: "deshedding-brush",
    section: "Grooming",
    name: "Deshedding brush",
    blurb: "Pull loose fur before it ends up all over your couch.",
    url: "",
  },
  {
    id: "toothbrush-kit",
    section: "Grooming",
    name: "Pet toothbrush + toothpaste kit",
    blurb: "Clean teeth at home and head off pricey dental trouble later.",
    url: "",
  },
  {
    id: "travel-bowl",
    section: "Travel & sitter",
    name: "Collapsible travel bowl / water bottle",
    blurb: "Pack it flat so water is always within reach on the go.",
    url: "",
  },
];
