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
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (active) {
            setSubscription(null);
            setIsLoading(false);
          }
          return;
        }

        // 1. Fetch active subscription status
        const { data: subData, error: subErr } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
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
          .eq("user_id", user.id)
          .gte("created_at", startOfMonth);

        if (active) {
          if (subData) {
            setSubscription({
              id: subData.id,
              user_id: subData.user_id,
              status: subData.status,
              plan_tier: subData.plan_tier as "free" | "pro" | "escola",
              current_period_end: subData.current_period_end,
            });
          } else {
            // Default Free Tier
            setSubscription({
              id: "free",
              user_id: user.id,
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
