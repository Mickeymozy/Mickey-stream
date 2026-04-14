import { useState, useRef, useEffect } from "react";
import { Play, Pause, X, Radio, ChevronUp, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { radioStationService } from "@/integrations/mongodb/radioStations";
import { motion, AnimatePresence } from "framer-motion";

interface RadioStation {
  _id?: string;
  id?: string;
  name: string;
  streamUrl: string;
  logoUrl?: string | null;
  isActive?: boolean;
}

export const RadioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [expanded, setExpanded] = useState(false);

  const { data: stations } = useQuery({
    queryKey: ["radio-stations"],
    queryFn: async () => {
      const stationList = await radioStationService.getRadioStations();
      return stationList.filter((s) => s.isActive !== false);
    },
  });

  useEffect(() => {
    if (!audioRef.current || !currentStation) return;
    audioRef.current.src = currentStation.streamUrl;
    audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [currentStation]);

  const togglePlay = () => {
    if (!audioRef.current || !currentStation) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  const stop = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    setPlaying(false);
    setCurrentStation(null);
    setExpanded(false);
  };

  const selectStation = (station: RadioStation) => {
    setCurrentStation(station);
    setExpanded(false);
  };

  if (!stations || stations.length === 0) return null;

  return (
    <>
      <audio ref={audioRef} />
      <div className="fixed bottom-16 left-0 right-0 z-40">
        {/* Expanded station list */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-card/95 backdrop-blur-lg border-t border-border overflow-hidden"
            >
              <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                {stations.map((s) => (
                  <button
                    key={s._id || s.id || s.name}
                    onClick={() => selectStation(s)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      (currentStation?._id === s._id || currentStation?.id === s.id) ? "bg-primary/20" : "hover:bg-accent/30"
                    }`}
                  >
                    {s.logoUrl ? (
                      <img src={s.logoUrl} alt={s.name} className="w-8 h-8 rounded-full object-cover bg-black" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Radio className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <span className="text-xs font-medium truncate">{s.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mini player bar */}
        <div className="bg-card/95 backdrop-blur-lg border-t border-border px-3 py-2">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 flex-1 min-w-0">
              {currentStation?.logoUrl ? (
                <img src={currentStation.logoUrl} alt="" className="w-8 h-8 rounded-full object-cover bg-black flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Radio className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className="text-left min-w-0">
                <p className="text-xs font-semibold truncate">
                  {currentStation ? currentStation.name : "📻 Radio"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {currentStation ? (playing ? "Playing" : "Paused") : "Tap to choose station"}
                </p>
              </div>
              {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
            </button>

            {currentStation && (
              <div className="flex items-center gap-1">
                <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                  {playing ? <Pause className="w-4 h-4 text-primary-foreground" /> : <Play className="w-4 h-4 text-primary-foreground ml-0.5" />}
                </button>
                <button onClick={stop} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent/30">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
