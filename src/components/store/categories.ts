export const STORE_CATEGORIES = [
  { name: 'Fashion', examples: 'Clothes, shoes, bags, jewellery' },
  { name: 'Food', examples: 'Meals, snacks, cakes, drinks' },
  { name: 'Beauty', examples: 'Skincare, makeup, hair, perfume' },
  { name: 'Gadgets', examples: 'Phones, accessories, electronics' },
  { name: 'Home', examples: 'Furniture, decor, kitchen' },
  { name: 'Health', examples: 'Wellness, supplements, fitness' },
  { name: 'Kids', examples: 'Toys, baby items, school supplies' },
  { name: 'Art & crafts', examples: 'Handmade pieces, prints, gifts' },
  { name: 'Services', examples: 'Bookings, repairs, lessons' },
  { name: 'Other', examples: 'Anything else you sell' },
] as const;

export type StoreCategory = (typeof STORE_CATEGORIES)[number]['name'];
