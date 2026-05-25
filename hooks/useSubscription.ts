"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export interface Subscription {
  id: string;
  user_id: string;
  status: string;
  plan_tier: "free" | "pro" | "escola";
  current_period_end: string | null;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [monthlyPlanCount, setMonthlyPlanCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSubscription() {
      setIsLoading(true);
      try {
        const { getSupabaseConfig } = await import("@/lib/supabase/client");
        const config = getSupabaseConfig();
        const useMockDemo =
          typeof window !== "undefined" &&
          (localStorage.getItem("use_mock_demo") === "true" ||
            document.cookie.includes("use_mock_demo=true"));

        let activeUser = null;
        if (!config.isConfigured || useMockDemo) {
          activeUser = {
            id: "mock-user-id-teacher",
            email: "professora.teste@planejaai.com",
          };
        } else {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          activeUser = user;
        }

        if (!activeUser) {
          if (active) {
            setSubscription(null);
            setIsLoading(false);
          }
          return;
        }

        if (!config.isConfigured || useMockDemo) {
          if (active) {
            setSubscription({
              id: "sub-mock-pro",
              user_id: activeUser.id,
              status: "active",
              plan_tier: "pro",
              current_period_end: new Date(
                Date.now() + 30 * 86400000
              ).toISOString(),
            });
            setMonthlyPlanCount(2);
          }
          return;
        }

        // 1. Fetch active subscription status
        const { data: subData, error: subErr } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", activeUser.id)
          .maybeSingle();

        // 2. Count monthly generated lesson plans
        const now = new Date();
        const startOfMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        ).toISOString();

        const { count, error: countErr } = await supabase
          .from("lesson_plans")
          .select("*", { count: "exact", head: true })
          .eq("user_id", activeUser.id)
          .gte("created_at", startOfMonth);

        if (active) {
          if (subData) {
            const mappedTier =
              subData.plan_tier === "school" ? "escola" : subData.plan_tier;
            setSubscription({
              id: subData.id,
              user_id: subData.user_id,
              status: subData.status,
              plan_tier: mappedTier as "free" | "pro" | "escola",
              current_period_end: subData.current_period_end,
            });
          } else {
            // Default Free Tier
            setSubscription({
              id: "free",
              user_id: activeUser.id,
              status: "active",
              plan_tier: "free",
              current_period_end: null,
            });
          }
          setMonthlyPlanCount(count || 0);
        }
      } catch (err) {
        console.error("Erro no hook useSubscription:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadSubscription();

    // Listen for auth state changes to reload
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(() => {
      loadSubscription();
    });

    return () => {
      active = false;
      authListener.unsubscribe();
    };
  }, []);

  const isFree = !subscription || subscription.plan_tier === "free";
  const isPro = subscription?.plan_tier === "pro";
  const isEscola = subscription?.plan_tier === "escola";
  const isPaid = isPro || isEscola;
  const isLimitReached = isFree && monthlyPlanCount >= 3;

  return {
    subscription,
    planTier: subscription?.plan_tier || "free",
    monthlyPlanCount,
    isFree,
    isPro,
    isEscola,
    isPaid,
    isLimitReached,
    isLoading,
  };
}
