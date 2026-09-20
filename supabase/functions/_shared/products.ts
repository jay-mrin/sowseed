export type BookProduct = {
  id: string;
  title: string;
  itemName: string;
};

export const BOOK_PRODUCTS: Record<string, BookProduct> = {
  "love-and-protection": {
    id: "love-and-protection",
    title: "Love & Protection",
    itemName: "Digital Book - Love & Protection",
  },
  "my-soulmate": {
    id: "my-soulmate",
    title: "My Soulmate",
    itemName: "Digital Book - My Soulmate",
  },
  "jesus-and-love": {
    id: "jesus-and-love",
    title: "Jesus & Love",
    itemName: "Digital Book - Jesus & Love",
  },
};

export function getBookProduct(value: unknown) {
  return BOOK_PRODUCTS[String(value || "").trim()] || null;
}
