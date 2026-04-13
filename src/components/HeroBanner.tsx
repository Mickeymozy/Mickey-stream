import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MANUAL_SLIDERS } from "@/lib/sliderConfig";

interface Slide {
  id: string;
  image: string;
  title: string;
  description: string;
}

const STORAGE_KEY = "mickey_sliders";

export const HeroBanner = () => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);

  // Load sliders from localStorage or use defaults
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const sliderData = saved ? JSON.parse(saved) : MANUAL_SLIDERS;
    const filtered = sliderData
      .filter((s: any) => s.is_active)
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((s: any) => ({ id: s.id, image: s.image_url, title: s.title, description: s.description }));
    setSlides(filtered);
  }, []);

  const next = useCallback(() => {
    setSlides((prev) => (prev.length > 0 ? prev : slides));
    setCurrent((prev) => (prev + 1) % Math.max(1, slides.length));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden bg-card">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current]?.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img src={slides[current]?.image} alt={slides[current]?.title} className="w-full h-full object-cover" />
          <div className="gradient-hero absolute inset-0" />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="font-display font-bold text-lg md:text-2xl mb-1">{slides[current]?.title}</h2>
            <p className="text-xs md:text-sm text-muted-foreground">{slides[current]?.description}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-2 right-4 flex gap-1.5">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-primary w-4" : "bg-foreground/30"}`} />
        ))}
      </div>
    </div>
  );
};
