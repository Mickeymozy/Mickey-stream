import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MANUAL_SLIDERS } from "@/lib/sliderConfig";

interface Slide {
  id: string;
  image: string;
  title: string;
  description: string;
}

export const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  // Use manual sliders directly
  const slides: Slide[] = MANUAL_SLIDERS
    .filter((s) => s.is_active)
    .sort((a, b) => a.display_order - b.display_order)
    .map((s) => ({ id: s.id, image: s.image_url, title: s.title, description: s.description }));

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  // Reset current if slides change
  useEffect(() => {
    setCurrent(0);
  }, [slides]);

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
