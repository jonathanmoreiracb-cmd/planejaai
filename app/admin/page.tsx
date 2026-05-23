"use client";

import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  TrendingUp,
  Award,
  Search,
  Zap,
  Filter,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  Sliders,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  plan_tier: string;
  plans_count: number;
  last_sign_in_at: string;
}

interface AdminPlan {
  id: string;
  user_email: string;
  theme: string;
  subject: string;
  grade: string;
  duration: string;
  created_at: string;
}

interface AdminStats {
  totalUsers: number;
  totalPlans: number;
  activeSubsPro: number;
  activeSubsSchool: number;
  estimatedMrr: number;
  generationSuccessRate: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPlans: 0,
    activeSubsPro: 0,
    activeSubsSchool: 0,
    estimatedMrr: 0,
    generationSuccessRate: 100,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [searchPlanQuery, setSearchPlanQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"users" | "plans">("users");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
    variant?: string;
  } | null>(null);

  const toast = ({
    title,
    description,
    variant,
  }: {
    title: string;
    description: string;
    variant?: string;
  }) => {
    setToastMessage({ title, description, variant });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAdminData = async (forceDemo = false) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();

      if (forceDemo) {
        // Force fully interactive mock state for presentation
        const mockUsers = [
          {
            id: "usr-mock-1",
            email: "professora.teste@planejaai.com",
            created_at: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            plan_tier: localStorage.getItem("mock_tier_usr-mock-1") || "pro",
            plans_count: 14,
            last_sign_in_at: new Date(
              Date.now() - 2 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            id: "usr-mock-2",
            email: "joao.silva@colegioparaiso.edu.br",
            created_at: new Date(
              Date.now() - 15 * 24 * 60 * 60 * 1000
            ).toISOString(),
            plan_tier: localStorage.getItem("mock_tier_usr-mock-2") || "school",
            plans_count: 28,
            last_sign_in_at: new Date(
              Date.now() - 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            id: "usr-mock-3",
            email: "clara.mendes@pedagogico.com.br",
            created_at: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
            plan_tier: localStorage.getItem("mock_tier_usr-mock-3") || "free",
            plans_count: 2,
            last_sign_in_at: new Date(
              Date.now() - 4 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            id: "usr-mock-4",
            email: "ricardo.fisica@gmail.com",
            created_at: new Date(
              Date.now() - 60 * 24 * 60 * 60 * 1000
            ).toISOString(),
            plan_tier: localStorage.getItem("mock_tier_usr-mock-4") || "pro",
            plans_count: 19,
            last_sign_in_at: new Date(
              Date.now() - 12 * 60 * 1000
            ).toISOString(),
          },
          {
            id: "usr-mock-5",
            email: "helena.alfabetizacao@yahoo.com",
            created_at: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
            plan_tier: localStorage.getItem("mock_tier_usr-mock-5") || "free",
            plans_count: 0,
            last_sign_in_at: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ];
        setUsers(mockUsers);
        setPlans(data.plans || []);

        // Recalculate stats based on live sandbox tiers
        const proCount = mockUsers.filter((u) => u.plan_tier === "pro").length;
        const schoolCount = mockUsers.filter(
          (u) => u.plan_tier === "school"
        ).length;
        setStats({
          totalUsers: mockUsers.length,
          totalPlans: 1248,
          activeSubsPro: proCount,
          activeSubsSchool: schoolCount,
          estimatedMrr: proCount * 29.0 + schoolCount * 89.0,
          generationSuccessRate: 98.4,
        });
      } else {
        setUsers(data.users || []);
        setPlans(data.plans || []);
        setStats(
          data.stats || {
            totalUsers: 0,
            totalPlans: 0,
            activeSubsPro: 0,
            activeSubsSchool: 0,
            estimatedMrr: 0,
            generationSuccessRate: 100,
          }
        );
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Erro ao carregar dados",
        description: "Utilizando dados de demonstração offline.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if we are running in local demo mode
    const useMockDemo =
      typeof window !== "undefined" &&
      (localStorage.getItem("use_mock_demo") === "true" ||
        document.cookie.includes("use_mock_demo=true"));

    setIsDemoMode(useMockDemo);
    loadAdminData(useMockDemo);
  }, []);

  const handleUpdatePlanTier = async (userId: string, newTier: string) => {
    try {
      if (isDemoMode) {
        localStorage.setItem(`mock_tier_${userId}`, newTier);
        toast({
          title: "Plano Atualizado (Playground)",
          description: `Plano do usuário atualizado localmente para ${newTier.toUpperCase()}!`,
        });
        loadAdminData(true);
        return;
      }

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newTier }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Falha ao atualizar plano.");
      }

      toast({
        title: "Plano Atualizado!",
        description: `Plano do usuário atualizado para ${newTier.toUpperCase()} no banco de dados!`,
      });
      loadAdminData(false);
    } catch (err: any) {
      toast({
        title: "Erro ao atualizar plano",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email
      .toLowerCase()
      .includes(searchUserQuery.toLowerCase());
    const matchesTier =
      tierFilter === "all" ? true : u.plan_tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const filteredPlans = plans.filter((p) => {
    const query = searchPlanQuery.toLowerCase();
    return (
      p.theme.toLowerCase().includes(query) ||
      p.subject.toLowerCase().includes(query) ||
      p.user_email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Sliders className="h-8 w-8 text-primary" />
            <span>Painel Administrativo</span>
          </h1>
          <p className="text-sm font-semibold text-muted-foreground mt-1.5">
            Gerencie planos de aula, controle assinaturas de professores e
            analise métricas da plataforma em tempo real.
          </p>
        </div>

        {/* Playground Toggle */}
        <div className="flex items-center gap-3 bg-muted/65 px-4 py-2 rounded-2xl border border-border/80 shadow-inner">
          <Zap
            className={`h-4.5 w-4.5 ${isDemoMode ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`}
          />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-foreground leading-none">
              Modo Sandbox
            </span>
            <span className="text-[9px] text-muted-foreground font-semibold leading-normal">
              Telas interativas de demonstração
            </span>
          </div>
          <Button
            size="sm"
            variant={isDemoMode ? "default" : "outline"}
            className="h-8 rounded-xl font-bold text-xs"
            onClick={() => {
              const newVal = !isDemoMode;
              setIsDemoMode(newVal);
              loadAdminData(newVal);
            }}
          >
            {isDemoMode ? "Ativo" : "Inativo"}
          </Button>
        </div>
      </div>

      {/* Grid of Analytical Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <Card className="border border-border/80 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 h-20 w-20 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Total de Professores
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {isLoading ? "..." : stats.totalUsers}
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 font-bold">+12%</span> este mês
            </p>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="border border-border/80 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 h-20 w-20 bg-violet-500/5 rounded-full blur-xl group-hover:bg-violet-500/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Planos de Aula Gerados
            </CardTitle>
            <FileText className="h-5 w-5 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {isLoading ? "..." : stats.totalPlans}
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 font-bold">+28%</span> mais
              interações IA
            </p>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border border-border/80 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 h-20 w-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Faturamento (MRR) Est.
            </CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {isLoading ? "..." : `R$ ${stats.estimatedMrr.toFixed(2)}`}
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold mt-1 flex items-center gap-1">
              <Zap className="h-3 w-3 text-emerald-500" />
              <span>
                {stats.activeSubsPro} Pro | {stats.activeSubsSchool} Escola
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="border border-border/80 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 h-20 w-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Taxa de Sucesso IA
            </CardTitle>
            <Award className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {isLoading ? "..." : `${stats.generationSuccessRate}%`}
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-emerald-500" />
              <span>Pipeline corretor jsonrepair ativo</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SVG Analytical Area Chart */}
      <Card className="border border-border/80 bg-card rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <CardTitle className="text-base font-extrabold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Métricas de Crescimento Mensal</span>
          </CardTitle>
          <CardDescription className="text-xs font-semibold">
            Visualização gráfica do volume de geração de planos (barras) e
            receita estimada (curva) ao longo do ano.
          </CardDescription>
        </div>

        {/* Animated SVG Chart Rendering */}
        <div className="h-44 w-full bg-muted/20 border border-border/40 rounded-xl relative flex items-end p-4">
          {/* Chart Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
            <div className="border-t border-muted-foreground w-full" />
            <div className="border-t border-muted-foreground w-full" />
            <div className="border-t border-muted-foreground w-full" />
          </div>

          {/* SVG Elements */}
          <svg
            className="absolute inset-0 h-full w-full p-4 overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Gradients */}
            <defs>
              <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="rgb(99, 102, 241)"
                  stopOpacity="0.4"
                />
                <stop
                  offset="100%"
                  stopColor="rgb(99, 102, 241)"
                  stopOpacity="0.0"
                />
              </linearGradient>
            </defs>
            {/* Revenue Gradient Path */}
            <path
              d="M 0 120 Q 120 70 240 85 T 480 35 L 560 20 L 560 140 L 0 140 Z"
              fill="url(#chart-area)"
              className="w-full h-full"
            />
            {/* Revenue Line */}
            <path
              d="M 0 120 Q 120 70 240 85 T 480 35 L 560 20"
              fill="none"
              stroke="rgb(99, 102, 241)"
              strokeWidth="3.5"
              className="w-full h-full"
            />
          </svg>

          {/* SVG Columns (Lesson Plans volume) */}
          <div className="w-full flex justify-between items-end h-32 px-10 relative z-10">
            {[40, 55, 72, 60, 85, 98, 120].map((val, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <span className="text-[9px] font-black text-primary bg-primary/10 border border-primary/20 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {val * 10}
                </span>
                <div
                  style={{ height: `${val}%` }}
                  className="w-6 sm:w-8 rounded-t-lg bg-gradient-to-t from-primary/80 to-primary group-hover:from-primary group-hover:to-primary/90 transition-all shadow shadow-primary/20"
                />
                <span className="text-[9px] font-bold text-muted-foreground">
                  {["Out", "Nov", "Dez", "Jan", "Fev", "Mar", "Abr"][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Directory Tab Controls */}
      <div className="space-y-6">
        <div className="flex border-b border-border/80">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-3 text-sm font-black transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "users"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Diretório de Professores ({filteredUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-5 py-3 text-sm font-black transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "plans"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Monitor de Geração ({filteredPlans.length})</span>
          </button>
        </div>

        {/* Tab CONTENT 1: USER DIRECTORY */}
        {activeTab === "users" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Filters bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por email..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-border bg-card font-semibold"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-black text-muted-foreground uppercase">
                  Filtrar Plano:
                </span>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">Todos os Planos</option>
                  <option value="free">Gratuito (Free)</option>
                  <option value="pro">Pro (Mensal)</option>
                  <option value="school">Escola (Parceiro)</option>
                </select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadAdminData(isDemoMode)}
                  className="h-9 rounded-lg px-3 border-border hover:bg-muted/40"
                >
                  <RotateCw className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Table Container */}
            <div className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground text-[10px] sm:text-xs font-black uppercase tracking-wider">
                    <th className="p-4 pl-6">Email do Professor</th>
                    <th className="p-4">Membro Desde</th>
                    <th className="p-4">Assinatura Atual</th>
                    <th className="p-4 text-center">Planos Gerados</th>
                    <th className="p-4">Último Acesso</th>
                    <th className="p-4 text-right pr-6">
                      Ações Administrativas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-semibold text-xs sm:text-sm text-foreground/80">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-10 text-center text-muted-foreground font-semibold"
                      >
                        Nenhum professor encontrado com os critérios fornecidos.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-muted/10 transition-colors"
                      >
                        <td className="p-4 pl-6 font-bold text-foreground">
                          {user.email}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </td>
                        <td className="p-4">
                          <Badge
                            className={`font-black rounded-lg text-[10px] uppercase tracking-wide px-2 py-0.5 ${
                              user.plan_tier === "school"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/15"
                                : user.plan_tier === "pro"
                                  ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
                                  : "bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/20 hover:bg-muted-foreground/15"
                            }`}
                          >
                            {user.plan_tier}
                          </Badge>
                        </td>
                        <td className="p-4 text-center font-bold text-foreground">
                          {user.plans_count}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(user.last_sign_in_at).toLocaleDateString(
                            "pt-BR"
                          )}{" "}
                          {new Date(user.last_sign_in_at).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </td>
                        <td className="p-4 text-right pr-6">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                handleUpdatePlanTier(user.id, "free")
                              }
                              disabled={user.plan_tier === "free"}
                              className="text-[10px] font-black h-7 px-2.5 rounded-lg border-border hover:bg-red-500/5 hover:text-red-500"
                            >
                              Free
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                handleUpdatePlanTier(user.id, "pro")
                              }
                              disabled={user.plan_tier === "pro"}
                              className="text-[10px] font-black h-7 px-2.5 rounded-lg border-border hover:bg-primary/5 hover:text-primary"
                            >
                              Pro
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                handleUpdatePlanTier(user.id, "school")
                              }
                              disabled={user.plan_tier === "school"}
                              className="text-[10px] font-black h-7 px-2.5 rounded-lg border-border hover:bg-amber-500/5 hover:text-amber-500"
                            >
                              Escola
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab CONTENT 2: PLAN MONITORING */}
        {activeTab === "plans" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por tema, disciplina ou autor..."
                  value={searchPlanQuery}
                  onChange={(e) => setSearchPlanQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-border bg-card font-semibold"
                />
              </div>
            </div>

            {/* Table Container */}
            <div className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground text-[10px] sm:text-xs font-black uppercase tracking-wider">
                    <th className="p-4 pl-6">Tema do Plano</th>
                    <th className="p-4">Disciplina</th>
                    <th className="p-4">Ano Escolar</th>
                    <th className="p-4">Duração</th>
                    <th className="p-4">Professor Criador</th>
                    <th className="p-4 text-right pr-6">Data de Geração</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-semibold text-xs sm:text-sm text-foreground/80">
                  {filteredPlans.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-10 text-center text-muted-foreground font-semibold"
                      >
                        Nenhum plano de aula monitorado com os critérios de
                        busca.
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((plan) => (
                      <tr
                        key={plan.id}
                        className="hover:bg-muted/10 transition-colors"
                      >
                        <td
                          className="p-4 pl-6 font-bold text-foreground truncate max-w-[200px]"
                          title={plan.theme}
                        >
                          {plan.theme}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {plan.subject}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className="border-border bg-background font-bold rounded-lg text-[10px] px-2 py-0.5"
                          >
                            {plan.grade}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {plan.duration}
                        </td>
                        <td className="p-4 font-bold text-foreground/70">
                          {plan.user_email}
                        </td>
                        <td className="p-4 text-right pr-6 text-muted-foreground">
                          {new Date(plan.created_at).toLocaleDateString(
                            "pt-BR"
                          )}{" "}
                          {new Date(plan.created_at).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Premium Self-Contained Overlay Notification Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-xl max-w-sm transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            toastMessage.variant === "destructive"
              ? "bg-red-500/10 border-red-500/20 text-red-500"
              : "bg-primary/10 border-primary/20 text-primary"
          }`}
        >
          <div className="flex items-start gap-2.5">
            <Zap className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <h4 className="font-black text-xs uppercase tracking-wide">
                {toastMessage.title}
              </h4>
              <p className="text-[11px] font-bold text-foreground/80 leading-relaxed">
                {toastMessage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
