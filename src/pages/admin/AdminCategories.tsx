import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2, Grid3x3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/integrations/mongodb/categories";
import { useState } from "react";
import { toast } from "sonner";

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", icon: "", displayOrder: 0 });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      return await categoryService.getCategories();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editId) {
        await categoryService.updateCategory(editId, {
          name: form.name,
          icon: form.icon || undefined,
          displayOrder: form.displayOrder,
        });
      } else {
        await categoryService.createCategory({
          name: form.name,
          icon: form.icon || undefined,
          displayOrder: form.displayOrder,
        });
      }
    },
    onSuccess: () => {
      toast.success(editId ? "Category updated" : "Category added");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await categoryService.deleteCategory(id);
    },
    onSuccess: () => { 
      toast.success("Deleted"); 
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] }); 
      queryClient.invalidateQueries({ queryKey: ["categories"] }); 
    },
    onError: (e: any) => toast.error(e.message),
  });

  const resetForm = () => { setShowForm(false); setEditId(null); setForm({ name: "", icon: "", displayOrder: 0 }); };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-3">
        <div className="flex items-center gap-2 mb-4">
          <Link to="/admin" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent"><ArrowLeft className="w-4 h-4" /></Link>
          <Grid3x3 className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-xl flex-1">Categories</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-lg p-4 mb-4 border border-border space-y-3">
            <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Category Name" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.icon} onChange={(e) => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="Icon (emoji)" className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
              <input type="number" value={form.displayOrder} onChange={(e) => setForm(p => ({ ...p, displayOrder: parseInt(e.target.value) || 0 }))} placeholder="Order" className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                {editId ? "Update" : "Add Category"}
              </button>
              <button onClick={resetForm} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-accent">Cancel</button>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton-loading h-14 rounded-lg" />)}</div>
        ) : (
          <div className="space-y-2">
            {categories?.map((cat) => (
              <div key={cat._id} className="bg-card rounded-lg p-3 flex items-center gap-3 border border-border">
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1"><p className="text-sm font-medium">{cat.name}</p><p className="text-[10px] text-muted-foreground">Order: {cat.displayOrder}</p></div>
                <button onClick={() => { setEditId(cat._id!); setForm({ name: cat.name, icon: cat.icon || "", displayOrder: cat.displayOrder }); setShowForm(true); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteMutation.mutate(cat._id!)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-destructive/20 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default AdminCategories;
