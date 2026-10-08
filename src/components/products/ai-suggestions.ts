export type AiSuggestion = {
  name: string;
  description: string;
  price: number;
};

const SUGGESTIONS: AiSuggestion[] = [
  {
    name: 'Ankara Wrap Dress',
    description: 'Vibrant Ankara wrap dress, soft cotton blend. Available in sizes M–XL.',
    price: 18500,
  },
  {
    name: 'Lace Blouse Set',
    description: 'Elegant lace blouse with matching inner. Perfect for owambe and Sunday service.',
    price: 22000,
  },
  {
    name: 'Plain Cotton Shirt',
    description: 'Breathable cotton shirt with a clean finish. Easy everyday wear.',
    price: 9500,
  },
  {
    name: 'Beaded Necklace',
    description: 'Handcrafted beaded necklace. Lightweight and made to last.',
    price: 6500,
  },
];

/** Demo AI suggestions until a vision model is connected. */
export function suggestFromPhoto(seed = Date.now()): AiSuggestion {
  return SUGGESTIONS[seed % SUGGESTIONS.length];
}
