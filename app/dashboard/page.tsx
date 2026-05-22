"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Sidebar } from "@/components/layout/sidebar";
import {
  Sparkles,
  Clock,
  BookOpen,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  FolderHeart,
  TrendingUp,
  Inbox,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface LessonPlanRecord {
  id: string;
  user_id: string;
  title: string;
  theme: string;
  subject: string;
  grade: string;
  duration: string;
  plan_data: any;
  created_at: string;
}

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string>("Professor(a)");
  const [plans, setPlans] = useState<LessonPlanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterGrade, setFilterGrade] = useState<string>("Todos");
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { getSupabaseConfig } = await import("@/lib/supabase/client");
        const config = getSupabaseConfig();

        let activeUser = null;
        if (!config.isConfigured) {
          activeUser = {
            email: "professora.teste@planejaai.com",
          };
        } else {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          activeUser = user;
        }

        if (activeUser) {
          setUserEmail(activeUser.email || "Professor(a)");

          if (!config.isConfigured) {
            // Render simulated lesson plans in local demo mode
            setPlans([
              {
                id: "plan-mock-1",
                user_id: "mock-user-id",
                title: "Alfabetização Lúdica e Jogos Silábicos",
                theme: "Jogos com Letras e Sílabas Complexas",
                subject: "Português",
                grade: "1º ano EF",
                duration: "45min",
                plan_data: {},
                created_at: new Date().toISOString(),
              },
              {
                id: "plan-mock-2",
                user_id: "mock-user-id",
                title: "Explorando os Ciclos da Água na Natureza",
                theme: "O Ciclo da Água e a Preservação Ambiental",
                subject: "Ciências",
                grade: "4º ano EF",
                duration: "90min",
                plan_data: {},
                created_at: new Date(Date.now() - 86400000).toISOString(),
              },
            ]);
          } else {
            const { data: lessonPlans, error: plansError } = await supabase
              .from("lesson_plans")
              .select("*")
              .order("created_at", { ascending: false });

            if (plansError) throw plansError;
            setPlans(lessonPlans || []);
          }
        } else {
          router.push("/login");
        }
      } catch (err: any) {
        console.error("Erro no carregamento do dashboard:", err);
        setError(
          "Não foi possível carregar o histórico de planos. Tente novamente."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleDeletePlan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (
      !confirm(
        "Tem certeza que deseja excluir permanentemente este plano de aula?"
      )
    )
      return;

    try {
      const { error: deleteErr } = await supabase
        .from("lesson_plans")
        .delete()
        .eq("id", id);

      if (deleteErr) throw deleteErr;

      // Reactively filter out deleted plan from UI
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error(err);
      alert("Falha ao deletar o plano de aula do histórico.");
    }
  };

  // Extract unique school years / classes for filtering
  const grades = ["Todos", ...Array.from(new Set(plans.map((p) => p.grade)))];

  // Filter plans based on selection
  const filteredPlans =
    filterGrade === "Todos"
      ? plans
      : plans.filter((p) => p.grade === filterGrade);

  // Dynamic statistics
  const totalPlans = plans.length;
  const uniqueGradesCount = new Set(plans.map((p) => p.grade)).size;
  const uniqueSubjectsCount = new Set(plans.map((p) => p.subject)).size;

  const stats = [
    {
      label: "Total de Planos",
      value: String(totalPlans),
      icon: BookOpen,
      gradient: "from-indigo-500/10 to-indigo-500/5 text-primary",
    },
    {
      label: "Turmas Atendidas",
      value: String(uniqueGradesCount),
      icon: GraduationCap,
      gradient: "from-rose-500/10 to-rose-500/5 text-secondary",
    },
    {
      label: "Disciplinas",
      value: String(uniqueSubjectsCount),
      icon: FolderHeart,
      gradient: "from-amber-500/10 to-amber-500/5 text-amber-500",
    },
    {
      label: "Gerações Ilimitadas",
      value: "Ativo",
      icon: Sparkles,
      gradient: "from-emerald-500/10 to-emerald-500/5 text-emerald-500",
    },
  ];

  return (
    <div className="flex-1 flex bg-background min-h-screen">
      {/* Sidebar Panel */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow p-4 sm:p-8 overflow-y-auto space-y-6 max-w-6xl mx-auto w-full animate-in fade-in duration-500 pb-16">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <span>Olá, {userEmail.split("@")[0]}</span>
              <span className="animate-bounce">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Seja bem-vindo ao seu painel. Seus planos de aulas inteligentes e
              geradores estão prontos.
            </p>
          </div>

          <a href="/planner">
            <Button className="bg-primary hover:bg-primary/95 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/10 flex items-center gap-2 transition-all">
              <Plus className="h-4.5 w-4.5" />
              <span>Novo Plano com IA</span>
            </Button>
          </a>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="rounded-2xl border-red-500/20 bg-red-500/5"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Aviso</AlertTitle>
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card
                key={idx}
                className="border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden"
              >
                <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-lg sm:text-2xl font-extrabold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-tr ${stat.gradient}`}
                  >
                    <Icon className="h-4.5 sm:h-5 w-4.5 sm:w-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters and List */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              <span>Meus Planos de Aula Salvos</span>
            </h2>

            {/* Turma filter toggle */}
            {plans.length > 0 && (
              <div className="flex flex-wrap gap-1.5 bg-muted/10 p-1 rounded-xl border border-border/60">
                {grades.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setFilterGrade(grade)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      filterGrade === grade
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <Clock className="h-8 w-8 text-primary/40 animate-spin" />
              <p className="text-xs text-muted-foreground font-semibold">
                Carregando seus planos de aula...
              </p>
            </div>
          ) : plans.length === 0 ? (
            /* Premium Empty State */
            <Card className="border-dashed border-border border-2 py-16 text-center rounded-2xl flex flex-col items-center justify-center bg-card/30">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Inbox className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">
                Nenhum plano gerado ainda
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1 max-w-sm px-4 leading-relaxed font-semibold">
                Você ainda não gerou nenhum plano de aula inteligente. Defina a
                realidade da sua escola e crie sua primeira aula alinhada com a
                BNCC!
              </CardDescription>
              <a href="/planner" className="mt-5">
                <Button className="bg-primary hover:bg-primary/95 text-white font-bold h-10 px-5 rounded-xl shadow-lg shadow-primary/10 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span>Criar Meu Primeiro Plano</span>
                </Button>
              </a>
            </Card>
          ) : filteredPlans.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs font-bold border border-dashed border-border rounded-2xl bg-muted/5">
              Nenhum plano encontrado para a turma selecionada.
            </div>
          ) : (
            /* Grid of plans */
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {filteredPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className="border-border bg-card hover:border-primary/30 hover:shadow-lg shadow-sm rounded-2xl flex flex-col justify-between overflow-hidden relative transition-all group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-80" />

                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-primary/10 hover:bg-primary/10 text-primary border-none font-extrabold text-[9px] uppercase tracking-wider">
                        {plan.subject}
                      </Badge>
                      <Badge className="bg-secondary/10 hover:bg-secondary/10 text-secondary border-none font-extrabold text-[9px] uppercase tracking-wider">
                        {plan.grade}
                      </Badge>
                    </div>

                    <CardTitle className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {plan.title}
                    </CardTitle>

                    <CardDescription className="text-[11px] font-semibold text-muted-foreground pt-1 flex items-center gap-1.5">
                      <span>Tema: {plan.theme}</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-5 py-2">
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold bg-muted/20 p-2 rounded-xl border border-border/40">
                      <span>Duração sugerida</span>
                      <span className="text-foreground font-bold">
                        {plan.duration}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t border-border/50 bg-muted/5 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 w-full">
                      <Button
                        onClick={() =>
                          router.push(`/planner?reopen=${plan.id}`)
                        }
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 rounded-xl border-border hover:border-primary/20 hover:text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Reabrir</span>
                      </Button>

                      <Button
                        onClick={() =>
                          router.push(`/planner?duplicate=${plan.id}`)
                        }
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 rounded-xl border-border hover:border-secondary/20 hover:text-secondary text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>Duplicar</span>
                      </Button>

                      <Button
                        onClick={(e) => handleDeletePlan(plan.id, e)}
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/5 rounded-xl shrink-0 transition-all"
                        title="Excluir Plano"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
