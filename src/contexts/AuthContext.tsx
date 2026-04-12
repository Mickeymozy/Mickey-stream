import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  profile: any | null;
  subscription: any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  profile: null,
  subscription: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);
  const [subscription, setSubscription] = useState<any | null>(null);

  const fetchUserData = async (userId: string, email: string | undefined) => {
    // 1. HARDCODED ADMIN CHECK
    // Hapa tunampa u-admin mickidadyhamza@gmail.com moja kwa moja
    if (email === "mickidadyhamza@gmail.com") {
      setIsAdmin(true);
    } else {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      setIsAdmin(roles?.some((r) => r.role === "admin") ?? false);
    }

    // 2. Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile(profileData);

    // 3. Fetch subscription
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    setSubscription(sub);
  };

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchUserData(session.user.id, session.user.email);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setSubscription(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    return () => authSub.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // HAPA NDIPO TUNARUKA MFUMO WA KAWAIDA KWA AJILI YAKO
    if (email === "mickidadyhamza@gmail.com" && password === "MICKEY24@") {
       // Tunajaribu kuku-sign in kwanza ili upate session
       const { error } = await supabase.auth.signInWithPassword({ email, password });
       
       // Kama account haipo kwenye database bado, tutatoa ujumbe
       if (error) {
         toast.error("Admin: Tafadhali jisajili kwanza kwa email hii mara moja kisha uingie.");
         throw error;
       }
       return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, phone: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, phone },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setSubscription(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, profile, subscription, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
