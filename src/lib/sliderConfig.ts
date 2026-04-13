export interface Slider {
  id: string;
  image_url: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export const MANUAL_SLIDERS: Slider[] = [
  {
    id: "1",
    image_url: "https://images.unsplash.com/photo-1461896836934-bd45ba48b2b5?w=800&q=80",
    title: "Welcome to Mickey Stream",
    description: "Watch live channels in HD quality",
    display_order: 1,
    is_active: true,
  },
  {
    id: "2",
    image_url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80",
    title: "Live Sports",
    description: "Get the latest sports action",
    display_order: 2,
    is_active: true,
  },
  {
    id: "3",
    image_url: "https://images.unsplash.com/photo-1518676590629-3dcbb9c5a5c9?w=800&q=80",
    title: "Entertainment",
    description: "Premium movies and shows",
    display_order: 3,
    is_active: true,
  },
];
