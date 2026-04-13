export interface Slider {
  id: string;
  image_url: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export const MANUAL_SLIDERS: Slider[] = [];
