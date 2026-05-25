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
  TrendingUp,
  Inbox,
  AlertCircle,
  GraduationCap,
  Calendar,
  Layers,
  ArrowRight,
  Compass,
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
  const [planTier, setPlanTier] = useState<string>("free");
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
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
            email: "professora.teste@planejaai.com",
          };
          setPlanTier("escola");
        } else {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          activeUser = user;

          // Fetch active plan tier
          if (user) {
            const { data: subData } = await supabase
              .from("subscriptions")
              .select("plan_tier")
              .eq("user_id", user.id)
              .maybeSingle();
            setPlanTier(subData?.plan_tier || "free");
          }
        }

        if (activeUser) {
          setUserEmail(activeUser.email || "Professor(a)");

          if (!config.isConfigured || useMockDemo) {
            let localPlans = [];
            const localPlansStr = localStorage.getItem("mock_lesson_plans");

            if (localPlansStr) {
              localPlans = JSON.parse(localPlansStr);
            } else {
              localPlans = [
                {
                  id: "plan-mock-1",
                  user_id: "mock-user-id-teacher",
                  title: "Frações Equivalentes com Círculos Visuais",
                  theme: "Explorando Frações e Divisão do Todo",
                  subject: "Matemática",
                  grade: "5º ano EF",
                  duration: "50min",
                  plan_data: {
                    weeks: [
                      {
                        weekNumber: 1,
                        theme: "Introdução Pedagógica",
                        days: [
                          {
                            day: 1,
                            topic: "Frações Práticas",
                            duration: "25min",
                            tasks: ["Cortar círculos", "Colorir partes"],
                          },
                        ],
                      },
                    ],
                  },
                  created_at: new Date().toISOString(),
                },
                {
                  id: "plan-mock-2",
                  user_id: "mock-user-id-teacher",
                  title: "Equilíbrio de Ecossistemas Locais",
                  theme: "Cadeia Alimentar e Ecologia Prática",
                  subject: "Ciências",
                  grade: "7º ano EF",
                  duration: "90min",
                  plan_data: {
                    weeks: [
                      {
                        weekNumber: 1,
                        theme: "Biodiversidade",
                        days: [
                          {
                            day: 1,
                            topic: "Teia alimentar",
                            duration: "45min",
                            tasks: [
                              "Identificar produtores",
                              "Mapear consumidores",
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  created_at: new Date(Date.now() - 86400000).toISOString(),
                },
              ];
              localStorage.setItem(
                "mock_lesson_plans",
                JSON.stringify(localPlans)
              );
            }
            setPlans(localPlans);
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
      const useMockDemo =
        typeof window !== "undefined" &&
        (localStorage.getItem("use_mock_demo") === "true" ||
          document.cookie.includes("use_mock_demo=true"));

      if (useMockDemo) {
        const localPlansStr = localStorage.getItem("mock_lesson_plans") || "[]";
        let localPlans = JSON.parse(localPlansStr);
        localPlans = localPlans.filter((p: any) => p.id !== id);
        localStorage.setItem("mock_lesson_plans", JSON.stringify(localPlans));
        setPlans(localPlans);
      } else {
        const { error: deleteErr } = await supabase
          .from("lesson_plans")
          .delete()
          .eq("id", id);

        if (deleteErr) throw deleteErr;
        setPlans((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err: any) {
      console.error(err);
      alert("Falha ao deletar o plano de aula do histórico.");
    }
  };

  const grades = ["Todos", ...Array.from(new Set(plans.map((p) => p.grade)))];

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
      label: "Planos Criados",
      value: String(totalPlans),
      growth: "+2 esta semana",
      icon: BookOpen,
    },
    {
      label: "Turmas Atendidas",
      value: String(uniqueGradesCount),
      growth: "Séries salvas",
      icon: GraduationCap,
    },
    {
      label: "Disciplinas",
      value: String(uniqueSubjectsCount),
      growth: "Matérias curriculares",
      icon: Layers,
    },
    {
      label: "Assinatura",
      value: planTier === "free" ? "Gratuito" : planTier.toUpperCase(),
      growth: planTier === "free" ? "Limites ativos" : "Premium Ativo ✨",
      icon: Sparkles,
    },
  ];

  // Pick the most recent plan for the Notion-style "Continue de onde parou" section
  const latestPlan = plans.length > 0 ? plans[0] : null;

  return (
    <div className="flex-grow flex bg-[#F8FAFC] dark:bg-slate-950 min-h-screen">
      {/* Sidebar Panel */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-grow p-4 sm:p-8 overflow-y-auto space-y-8 max-w-5xl mx-auto w-full animate-in fade-in duration-500 pb-20">
        {/* Internal Premium Welcome Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-800/80 bg-gradient-to-br from-white via-sky-50/20 to-indigo-50/20 dark:from-slate-900 dark:to-slate-900 p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-tr from-sky-400/10 to-indigo-400/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <span>Bom dia, {userEmail.split("@")[0]}</span>
                <span className="animate-pulse">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg font-medium leading-relaxed">
                Continue criando planejamentos pedagógicos com mais agilidade e
                poupe tempo para o que realmente importa: seus alunos.
              </p>
            </div>
            <a href="/planner" className="self-start sm:self-auto shrink-0">
              <Button className="bg-sky-600 hover:bg-sky-700 text-white font-bold h-11 px-6 rounded-xl shadow-md shadow-sky-600/15 flex items-center gap-2 transition-all">
                <Plus className="h-4.5 w-4.5" />
                <span>Novo Planejamento</span>
              </Button>
            </a>
          </div>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="rounded-2xl border-red-500/15 bg-red-500/5"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Aviso</AlertTitle>
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Metric Cards Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card
                key={idx}
                className="border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all rounded-2xl overflow-hidden group cursor-default"
              >
                <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                      {stat.value}
                    </p>
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-500 font-semibold flex items-center gap-0.5">
                      {stat.growth}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 group-hover:bg-sky-50 dark:group-hover:bg-sky-950/20 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    <Icon className="h-4.5 sm:h-5 w-4.5 sm:w-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Columns Grid */}
        <div className="grid gap-6 md:grid-cols-3 items-start">
          {/* Left / Middle: Workspace Card & Plans Grid */}
          <div className="md:col-span-2 space-y-6">
            {/* Protagonist Section: "Continue de onde parou" */}
            {latestPlan && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Continue de onde parou
                </h3>
                <Card className="border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 relative group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-pink-500" />
                  <CardHeader className="p-6 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-none font-bold text-[9px] uppercase tracking-wide px-2 py-0.5">
                            {latestPlan.subject}
                          </Badge>
                          <Badge className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-none font-bold text-[9px] uppercase tracking-wide px-2 py-0.5">
                            {latestPlan.grade}
                          </Badge>
                        </div>
                        <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors pt-1">
                          {latestPlan.title}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          Tema: {latestPlan.theme}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold shrink-0">
                        Última edição: Hoje
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 py-2 space-y-4">
                    {/* Simulated Notion style Progress Bar */}
                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>Tarefas do Planejamento</span>
                        <span>70% concluídas</span>
                      </div>
                      <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full w-[70%] rounded-full" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 p-4 flex justify-end gap-2">
                    <Button
                      onClick={() =>
                        router.push(`/planner?reopen=${latestPlan.id}`)
                      }
                      className="bg-sky-600 hover:bg-sky-700 text-white font-bold h-9 px-5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>Continuar</span>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* Plans List */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Histórico de Planejamentos
                </h3>

                {plans.length > 0 && (
                  <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50 self-start sm:self-auto">
                    {grades.map((grade) => (
                      <button
                        key={grade}
                        onClick={() => setFilterGrade(grade)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                          filterGrade === grade
                            ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm"
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
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
                  <Clock className="h-8 w-8 text-sky-400 animate-spin" />
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                    Carregando histórico...
                  </p>
                </div>
              ) : plans.length === 0 ? (
                /* Premium Notion-style Empty State */
                <Card className="border-dashed border-slate-200 dark:border-slate-800 border-2 py-16 text-center rounded-2xl flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-50/10 to-transparent pointer-events-none" />
                  <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 relative z-10">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 relative z-10">
                    Seu próximo planejamento começa aqui
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 max-w-sm px-4 leading-relaxed relative z-10">
                    Estruture aulas incríveis com facilidade. Escolha a série,
                    adicione o tema e receba tudo pronto alinhado à BNCC!
                  </CardDescription>
                  <a href="/planner" className="mt-5 relative z-10">
                    <Button className="bg-sky-600 hover:bg-sky-700 text-white font-bold h-10 px-5 rounded-xl shadow-md shadow-sky-600/10 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Criar Planejamento</span>
                    </Button>
                  </a>
                </Card>
              ) : filteredPlans.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
                  Nenhum plano encontrado para a turma selecionada.
                </div>
              ) : (
                /* Grid of plans */
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredPlans.map((plan) => (
                    <Card
                      key={plan.id}
                      className="border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-sky-300 dark:hover:border-slate-700 hover:shadow-md shadow-sm rounded-2xl flex flex-col justify-between overflow-hidden relative transition-all group cursor-pointer"
                      onClick={() => router.push(`/planner?reopen=${plan.id}`)}
                    >
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-none font-bold text-[9px] uppercase tracking-wide">
                            {plan.subject}
                          </Badge>
                          <Badge className="bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border-none font-bold text-[9px] uppercase tracking-wide">
                            {plan.grade}
                          </Badge>
                        </div>

                        <CardTitle className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug line-clamp-2">
                          {plan.title}
                        </CardTitle>

                        <CardDescription className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 flex items-center gap-1.5 font-medium">
                          <span>Tema: {plan.theme}</span>
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="px-5 py-2">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold bg-slate-50/50 dark:bg-slate-800/20 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50">
                          <span>Duração sugerida</span>
                          <span className="text-slate-700 dark:text-slate-300 font-bold">
                            {plan.duration}
                          </span>
                        </div>
                      </CardContent>

                      <CardFooter className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 w-full">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/planner?duplicate=${plan.id}`);
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 rounded-lg border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:text-slate-700 text-[10px] font-bold flex items-center justify-center gap-1 transition-all bg-white dark:bg-slate-900"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Duplicar</span>
                          </Button>

                          <Button
                            onClick={(e) => handleDeletePlan(plan.id, e)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg shrink-0 transition-all"
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

          {/* Right Column: Pedagogical Suggestions */}
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Sugestões Pedagógicas
            </h3>

            <Card className="border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Compass className="h-4.5 w-4.5 text-sky-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Temas sugeridos para você
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50/60 dark:bg-slate-800/30 rounded-xl border border-slate-100/50 dark:border-slate-800/50 space-y-1 hover:border-sky-200 dark:hover:border-sky-950 transition-colors cursor-pointer">
                  <Badge className="bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border-none text-[8px] font-bold py-0">
                    Matemática
                  </Badge>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    Frações equivalentes com círculos visuais
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    5º Ano do Ensino Fundamental
                  </p>
                </div>

                <div className="p-3 bg-slate-50/60 dark:bg-slate-800/30 rounded-xl border border-slate-100/50 dark:border-slate-800/50 space-y-1 hover:border-sky-200 dark:hover:border-sky-950 transition-colors cursor-pointer">
                  <Badge className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-none text-[8px] font-bold py-0">
                    Ciências
                  </Badge>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    Mapeamento de ecossistemas locais
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    7º Ano do Ensino Fundamental
                  </p>
                </div>

                <div className="p-3 bg-slate-50/60 dark:bg-slate-800/30 rounded-xl border border-slate-100/50 dark:border-slate-800/50 space-y-1 hover:border-sky-200 dark:hover:border-sky-950 transition-colors cursor-pointer">
                  <Badge className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-none text-[8px] font-bold py-0">
                    Português
                  </Badge>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    Interpretação e leitura ativa de contos
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    3º Ano do Ensino Médio
                  </p>
                </div>

                <div className="p-3 bg-slate-50/60 dark:bg-slate-800/30 rounded-xl border border-slate-100/50 dark:border-slate-800/50 space-y-1 hover:border-sky-200 dark:hover:border-sky-950 transition-colors cursor-pointer">
                  <Badge className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-none text-[8px] font-bold py-0">
                    História
                  </Badge>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    As revoluções no Brasil pós-república
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    9º Ano do Ensino Fundamental
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a href="/planner">
                  <Button
                    variant="outline"
                    className="w-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <span>Criar plano sugerido</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
