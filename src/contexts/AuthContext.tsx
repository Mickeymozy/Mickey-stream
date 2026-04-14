import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { subscriptionService } from "@/integrations/mongodb/subscriptions";
import { profileService } from "@/integrations/mongodb/profiles";
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
    if (email === "mickidadyhamza@gmail.com") {
      setIsAdmin(true);
    } else {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      setIsAdmin(roles?.some((r) => r.role === "admin") ?? false);
    }

    // 2. Fetch profile from MongoDB
    try {
      const profileData = await profileService.getProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }

    // 3. Fetch subscription from MongoDB
    try {
      const sub = await subscriptionService.getSubscription(userId);
      if (sub && sub.isActive) {
        setSubscription(sub);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setSubscription(null);
    }
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
    // Sign up user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, phone },
      },
    });
    if (error) throw error;

    // Create profile in MongoDB
    if (data.user?.id) {
      try {
        await profileService.createProfile({
          userId: data.user.id,
          firstName,
          lastName,
          email,
          status: "pending", // User status starts as pending until email verified
        });
      } catch (profileError) {
        console.error("Error creating profile in MongoDB:", profileError);
        // Don't fail the signup if profile creation fails
      }
    }
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
