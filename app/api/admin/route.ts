import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

// Force Next.js to treat this route as fully dynamic on every request
export const dynamic = "force-dynamic";

const verifyAdminPassword = (req: Request): boolean => {
  const headerPassword = req.headers.get("x-admin-password");
  const correctPassword = process.env.ADMIN_PASSWORD || "PlanejaAI2026!";
  return headerPassword === correctPassword;
};

export async function GET(req: Request) {
  try {
    if (!verifyAdminPassword(req)) {
      return NextResponse.json(
        { error: "Acesso administrativo negado. Senha incorreta." },
        { status: 401 }
      );
    }

    // Read environment variables dynamically at request runtime to bypass build-time static caching
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    const isConfigured =
      supabaseUrl &&
      supabaseUrl.startsWith("http") &&
      supabaseUrl !== "xxx" &&
      supabaseServiceRoleKey &&
      supabaseServiceRoleKey !== "xxx" &&
      supabaseServiceRoleKey !== "undefined" &&
      supabaseServiceRoleKey !== "null";

    if (!isConfigured) {
      // If unconfigured, return a mock/empty schema but with success status so the dashboard loads freely
      const foundKeys = Object.keys(process.env).filter(
        (k) =>
          k.includes("SUPABASE") ||
          k.includes("ROLE") ||
          k.includes("SERVICE") ||
          k.includes("ANON")
      );
      return NextResponse.json({
        isConfigured: false,
        users: [],
        plans: [],
        stats: {
          totalUsers: 0,
          totalPlans: 0,
          activeSubsPro: 0,
          activeSubsSchool: 0,
          estimatedMrr: 0.0,
          generationSuccessRate: 100.0,
        },
        debugKeys: foundKeys,
      });
    }

    // Initialize Supabase Admin client dynamically
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Fetch Auth Users using service role client
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (authError || !authData?.users) {
      return NextResponse.json(
        {
          error: `Falha ao obter lista de usuários do Supabase Auth: ${
            authError?.message || "Erro desconhecido"
          }. Verifique se a sua Service Role Key está correta no painel da Vercel.`,
        },
        { status: 500 }
      );
    }

    // 2. Fetch Subscription Data
    const { data: subsData, error: subsError } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id, plan_tier, status");

    if (subsError) {
      return NextResponse.json(
        { error: `Erro ao buscar assinaturas no banco: ${subsError.message}` },
        { status: 500 }
      );
    }

    // 3. Fetch Lesson Plans
    const { data: plansData, error: plansError } = await supabaseAdmin
      .from("lesson_plans")
      .select("id, user_id, theme, subject, grade, duration, created_at");

    if (plansError) {
      return NextResponse.json(
        {
          error: `Erro ao buscar planos de aula no banco: ${plansError.message}`,
        },
        { status: 500 }
      );
    }

    // Map subscriptions
    const subMap = new Map();
    (subsData || []).forEach((s) => {
      subMap.set(s.user_id, {
        plan_tier: s.status === "active" ? s.plan_tier : "free",
        status: s.status,
      });
    });

    // Map plans count per user
    const planCounts = new Map();
    (plansData || []).forEach((p) => {
      planCounts.set(p.user_id, (planCounts.get(p.user_id) || 0) + 1);
    });

    // Merge auth accounts with database tables
    const users = authData.users.map((u) => {
      const sub = subMap.get(u.id) || { plan_tier: "free", status: "inactive" };
      return {
        id: u.id,
        email: u.email || "Professor(a)",
        created_at: u.created_at,
        plan_tier: sub.plan_tier,
        plans_count: planCounts.get(u.id) || 0,
        last_sign_in_at: u.last_sign_in_at || u.created_at,
      };
    });

    const activePro = users.filter((u) => u.plan_tier === "pro").length;
    const activeSchool = users.filter((u) => u.plan_tier === "school").length;

    // Estimate MRR (Pro = R$ 29/month, School = R$ 89/month)
    const estimatedMrr = activePro * 29.0 + activeSchool * 89.0;

    const formattedPlans = (plansData || []).slice(0, 100).map((p) => {
      const author = users.find((u) => u.id === p.user_id);
      return {
        id: p.id,
        user_email: author?.email || "professor@planejaai.com",
        theme: p.theme,
        subject: p.subject,
        grade: p.grade,
        duration: p.duration,
        created_at: p.created_at,
      };
    });

    return NextResponse.json({
      isConfigured: true,
      users,
      plans: formattedPlans,
      stats: {
        totalUsers: users.length,
        totalPlans: (plansData || []).length,
        activeSubsPro: activePro,
        activeSubsSchool: activeSchool,
        estimatedMrr: estimatedMrr,
        generationSuccessRate: 100.0,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

// POST endpoint to manually upgrade/change user subscription plan tiers
export async function POST(req: Request) {
  try {
    if (!verifyAdminPassword(req)) {
      return NextResponse.json(
        { error: "Acesso administrativo negado. Senha incorreta." },
        { status: 401 }
      );
    }

    const { userId, newTier } = await req.json();

    if (!userId || !newTier) {
      return NextResponse.json(
        { error: "UserId and newTier are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    const isConfigured =
      supabaseUrl &&
      supabaseUrl.startsWith("http") &&
      supabaseUrl !== "xxx" &&
      supabaseServiceRoleKey &&
      supabaseServiceRoleKey !== "xxx" &&
      supabaseServiceRoleKey !== "undefined" &&
      supabaseServiceRoleKey !== "null";

    if (!isConfigured) {
      return NextResponse.json(
        {
          error:
            "Ação inválida: SUPABASE_SERVICE_ROLE_KEY não está configurada no servidor.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if the user already has a subscription row in the database
    const { data: existingSub, error: fetchError } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    let mutationError;
    if (existingSub) {
      // If a row exists, perform an update (providing dummy values for stripe fields in case they have NOT NULL constraints)
      const { error: updateError } = await supabaseAdmin
        .from("subscriptions")
        .update({
          plan_tier: newTier,
          status: newTier === "free" ? "inactive" : "active",
          stripe_customer_id:
            newTier === "free" ? "manual_free" : "manual_cus_" + randomUUID(),
          stripe_subscription_id:
            newTier === "free" ? "manual_free" : "manual_sub_" + randomUUID(),
          current_period_end:
            newTier === "free"
              ? new Date().toISOString()
              : "2099-12-31T23:59:59.000Z",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
      mutationError = updateError;
    } else {
      // If no row exists, perform an insert and explicitly supply all required columns to satisfy strict DB schemas
      const { error: insertError } = await supabaseAdmin
        .from("subscriptions")
        .insert({
          id: randomUUID(),
          user_id: userId,
          plan_tier: newTier,
          status: newTier === "free" ? "inactive" : "active",
          stripe_customer_id:
            newTier === "free" ? "manual_free" : "manual_cus_" + randomUUID(),
          stripe_subscription_id:
            newTier === "free" ? "manual_free" : "manual_sub_" + randomUUID(),
          current_period_end:
            newTier === "free"
              ? new Date().toISOString()
              : "2099-12-31T23:59:59.000Z",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      mutationError = insertError;
    }

    if (mutationError) {
      throw mutationError;
    }

    return NextResponse.json({
      success: true,
      message: `Plano do usuário atualizado para ${newTier} com sucesso!`,
    });
  } catch (err: any) {
    console.error("Admin POST mutation error:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao atualizar plano." },
      { status: 500 }
    );
  }
}
