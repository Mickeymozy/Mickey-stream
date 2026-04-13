import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { MANUAL_SLIDERS, type Slider } from "@/lib/sliderConfig";

const AdminSliders = () => {
  const [sliders, setSliders] = useState<Slider[]>(MANUAL_SLIDERS);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ image_url: "", title: "", description: "", display_order: 0 });

  const handleSave = () => {
    if (!form.image_url.trim()) {
      toast.error("Image URL is required");
      return;
    }

    if (editId) {
      setSliders((prev) =>
        prev.map((s) =>
          s.id === editId
            ? { ...s, image_url: form.image_url, title: form.title, description: form.description, display_order: form.display_order }
            : s
        )
      );
      toast.success("Slider updated");
    } else {
      const newSlider: Slider = {
        id: Date.now().toString(),
        image_url: form.image_url,
        title: form.title,
        description: form.description,
        display_order: form.display_order,
        is_active: true,
      };
      setSliders((prev) => [...prev, newSlider]);
      toast.success("Slider added");
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    setSliders((prev) => prev.filter((s) => s.id !== id));
    toast.success("Slider deleted");
  };

  const resetForm = () => { setShowForm(false); setEditId(null); setForm({ image_url: "", title: "", description: "", display_order: 0 }); };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-3">
        <div className="flex items-center gap-2 mb-4">
          <Link to="/admin" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent"><ArrowLeft className="w-4 h-4" /></Link>
          <Image className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-xl flex-1">Sliders</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add</button>
        </div>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-lg p-4 mb-4 border border-border space-y-3">
            <input value={form.image_url} onChange={(e) => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="Image URL *" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            <input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            <input value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            <input type="number" value={form.display_order} onChange={(e) => setForm(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))} placeholder="Order" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-bold">{editId ? "Update" : "Add Slider"}</button>
              <button onClick={resetForm} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-accent">Cancel</button>
            </div>
          </motion.div>
        )}
        <div className="space-y-2">
          {sliders.map((s) => (
            <div key={s.id} className="bg-card rounded-lg p-3 flex items-center gap-3 border border-border">
              {s.image_url && <img src={s.image_url} alt={s.title} className="w-16 h-10 rounded object-cover" />}
              <div className="flex-1"><p className="text-sm font-medium">{s.title || "Untitled"}</p><p className="text-[10px] text-muted-foreground">Order: {s.display_order}</p></div>
              <button onClick={() => { setEditId(s.id); setForm({ image_url: s.image_url, title: s.title, description: s.description, display_order: s.display_order }); setShowForm(true); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(s.id)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-destructive/20 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          {sliders.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No sliders yet</p>}
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default AdminSliders;
