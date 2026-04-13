import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";
import { ArrowLeft, Users, UserCheck, UserX, Trash2, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subscriptionService } from "@/integrations/mongodb/subscriptions";
import { useState } from "react";
import { toast } from "sonner";

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [subModal, setSubModal] = useState<{ userId: string; name: string } | null>(null);
  const [subDuration, setSubDuration] = useState<string>("1_month");

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase.from("profiles").update({ status: status as any }).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("User updated"); queryClient.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const assignSubMutation = useMutation({
    mutationFn: async ({ userId, duration }: { userId: string; duration: string }) => {
      const now = new Date();
      let expiresAt: Date;
      if (duration === "1_week") expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      else if (duration === "2_weeks") expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      else expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Create subscription in MongoDB
      await subscriptionService.createSubscription({
        userId,
        duration: duration as any,
        startsAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isActive: true,
      });

      // Activate user in Supabase
      await supabase.from("profiles").update({ status: "active" as any }).eq("user_id", userId);
    },
    onSuccess: () => {
      toast.success("Subscription assigned");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSubModal(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const statusColor: Record<string, string> = {
    active: "text-green-500",
    pending: "text-gold",
    blocked: "text-destructive",
    deleted: "text-muted-foreground",
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-3">
        <div className="flex items-center gap-2 mb-4">
          <Link to="/admin" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent"><ArrowLeft className="w-4 h-4" /></Link>
          <Users className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-xl">Users</h1>
        </div>

        {/* Subscription Modal */}
        {subModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm border border-white/20 shadow-2xl">
              <h3 className="font-display font-bold text-lg mb-1">Assign Subscription</h3>
              <p className="text-sm text-muted-foreground mb-4">{subModal.name}</p>
              <select value={subDuration} onChange={(e) => setSubDuration(e.target.value)} className="w-full bg-white/5 backdrop-blur border border-white/20 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:border-primary/50">
                <option value="1_week">1 Week</option>
                <option value="2_weeks">2 Weeks</option>
                <option value="1_month">1 Month</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => assignSubMutation.mutate({ userId: subModal.userId, duration: subDuration })} disabled={assignSubMutation.isPending} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                  {assignSubMutation.isPending ? "Assigning..." : "Assign"}
                </button>
                <button onClick={() => setSubModal(null)} className="px-4 py-2 rounded-lg text-sm border border-white/20 hover:bg-white/10">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton-loading h-16 rounded-lg" />)}</div>
        ) : (
          <div className="space-y-2">
            {profiles?.map((user) => (
              <div key={user.id} className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/20 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.first_name} {user.last_name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email} • {user.phone}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${statusColor[user.status] || ""}`}>{user.status}</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => updateStatusMutation.mutate({ userId: user.user_id, status: "active" })} className="flex-1 bg-green-500/20 backdrop-blur border border-green-500/30 text-green-400 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-green-500/30 transition">
                    <UserCheck className="w-3 h-3" /> Activate
                  </button>
                  <button onClick={() => updateStatusMutation.mutate({ userId: user.user_id, status: "blocked" })} className="flex-1 bg-destructive/20 backdrop-blur border border-destructive/30 text-destructive py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-destructive/30 transition">
                    <UserX className="w-3 h-3" /> Block
                  </button>
                  <button onClick={() => setSubModal({ userId: user.user_id, name: `${user.first_name} ${user.last_name}` })} className="flex-1 bg-gold/20 backdrop-blur border border-gold/30 text-gold py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-gold/30 transition">
                    <Crown className="w-3 h-3" /> Subscribe
                  </button>
                  <button onClick={() => updateStatusMutation.mutate({ userId: user.user_id, status: "deleted" })} className="w-8 flex items-center justify-center rounded hover:bg-destructive/20 text-destructive border border-destructive/30">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {profiles?.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No users yet</p>}
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default AdminUsers;
