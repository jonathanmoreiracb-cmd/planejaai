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
  Shield,
  Key,
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [enteredServiceKey, setEnteredServiceKey] = useState("");
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [searchPlanQuery, setSearchPlanQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"users" | "plans">("users");
  const [serverError, setServerError] = useState<string | null>(null);

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

  const loadAdminData = async (pwd: string, serviceKey?: string) => {
    setIsLoading(true);
    const activeServiceKey =
      serviceKey || sessionStorage.getItem("admin_service_key") || "";
    try {
      const res = await fetch("/api/admin", {
        headers: {
          "x-admin-password": pwd,
          "x-supabase-service-key": activeServiceKey,
        },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem("admin_auth_token");
        sessionStorage.removeItem("admin_service_key");
        throw new Error("Senha administrativa incorreta.");
      }

      const data = await res.json();
      if (data.error) {
        setServerError(data.error);
        throw new Error(data.error);
      }

      setServerError(null);
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
      setIsAuthenticated(true);
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Acesso Negado",
        description: e.message || "Erro ao conectar-se ao servidor.",
        variant: "destructive",
      });
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cachedToken = sessionStorage.getItem("admin_auth_token") || "";
    const cachedServiceKey = sessionStorage.getItem("admin_service_key") || "";
    if (cachedToken) {
      loadAdminData(cachedToken, cachedServiceKey);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingPassword(true);
    try {
      await loadAdminData(enteredPassword, enteredServiceKey);
      sessionStorage.setItem("admin_auth_token", enteredPassword);
      if (enteredServiceKey) {
        sessionStorage.setItem("admin_service_key", enteredServiceKey);
      }
      toast({
        title: "Acesso Autorizado",
        description: "Conexão administrativa segura estabelecida com sucesso!",
      });
    } catch (err) {
      // Handled in loadAdminData
    } finally {
      setIsCheckingPassword(false);
    }
  };

  const handleUpdatePlanTier = async (userId: string, newTier: string) => {
    try {
      const token = sessionStorage.getItem("admin_auth_token") || "";
      const serviceKey = sessionStorage.getItem("admin_service_key") || "";
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": token,
          "x-supabase-service-key": serviceKey,
        },
        body: JSON.stringify({ userId, newTier }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Falha ao alterar plano.");
      }

      toast({
        title: "Plano Alterado!",
        description: `Plano do usuário atualizado para ${newTier.toUpperCase()} com sucesso no banco de dados!`,
      });
      loadAdminData(token);
    } catch (err: any) {
      toast({
        title: "Erro na alteração",
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

  // Render password portal page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-950 text-white relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <Card className="w-full max-w-md border border-white/10 bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-8 space-y-6 shadow-2xl relative z-10">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 animate-pulse">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white mt-4">
              Área Restrita
            </h2>
            <p className="text-xs font-semibold text-slate-400 max-w-[280px]">
              Insira a senha administrativa para liberar o controle em tempo
              real da plataforma.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Key className="h-3 w-3 text-amber-500" />
                <span>Senha de Acesso</span>
              </label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                className="bg-slate-950/65 border-white/10 text-white placeholder-slate-600 rounded-xl h-12 focus:ring-amber-500 focus:border-amber-500 font-semibold"
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-violet-500" />
                <span>Chave de Serviço Supabase (service_role)</span>
              </label>
              <Input
                type="password"
                placeholder="Cole a service_role key do Supabase..."
                value={enteredServiceKey}
                onChange={(e) => setEnteredServiceKey(e.target.value)}
                className="bg-slate-950/65 border-white/10 text-white placeholder-slate-600 rounded-xl h-12 focus:ring-violet-500 focus:border-violet-500 font-semibold text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={isCheckingPassword || !enteredPassword}
              className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all hover:scale-[1.01]"
            >
              {isCheckingPassword ? (
                <span>Verificando...</span>
              ) : (
                <span>Entrar no Painel</span>
              )}
            </Button>
          </form>
        </Card>

        {/* Premium Self-Contained Overlay Notification Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-xl max-w-sm bg-red-500/10 border-red-500/20 text-red-500 animate-in slide-in-from-bottom-5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
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

        {/* Access Role Badge */}
        <div className="flex items-center gap-3 bg-muted/65 px-4 py-2 rounded-2xl border border-border/80 shadow-inner">
          <Shield className="h-4.5 w-4.5 text-amber-500 fill-amber-500/20" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-foreground leading-none">
              Acesso Real
            </span>
            <span className="text-[9px] text-muted-foreground font-semibold leading-normal">
              Conectado ao Banco de Dados
            </span>
          </div>
        </div>
      </div>

      {serverError && (
        <Card className="border-red-500/20 bg-red-500/5 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in duration-300">
          <AlertTriangle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-2 text-left">
            <h3 className="font-black text-sm uppercase text-red-500">
              Erro de Configuração das Chaves
            </h3>
            <p className="text-xs font-bold text-foreground/80">
              {serverError}
            </p>
            <div className="text-xs font-bold text-muted-foreground/90 mt-2 bg-background/50 p-4 rounded-xl border border-border/40 space-y-2.5">
              <p className="text-foreground font-extrabold uppercase text-[10px]">
                Como resolver no painel da Vercel:
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                <li>
                  Acesse o seu dashboard da{" "}
                  <span className="font-extrabold text-foreground">Vercel</span>
                  .
                </li>
                <li>
                  Abra o seu projeto{" "}
                  <span className="font-extrabold text-foreground">
                    PlanejaAI
                  </span>
                  .
                </li>
                <li>
                  Vá na aba{" "}
                  <span className="font-extrabold text-foreground">
                    Settings ➔ Environment Variables
                  </span>
                  .
                </li>
                <li>
                  Adicione a variável de ambiente:
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    <li>
                      <span className="font-mono text-primary font-black">
                        Key:
                      </span>{" "}
                      <code className="bg-muted px-1.5 py-0.5 rounded">
                        SUPABASE_SERVICE_ROLE_KEY
                      </code>
                    </li>
                    <li>
                      <span className="font-mono text-primary font-black">
                        Value:
                      </span>{" "}
                      (Sua chave secreta do Supabase, encontrada em Settings ➔
                      API ➔{" "}
                      <code className="bg-muted px-1.5 py-0.5 rounded">
                        service_role
                      </code>{" "}
                      /{" "}
                      <code className="bg-muted px-1.5 py-0.5 rounded">
                        secret
                      </code>
                      )
                    </li>
                  </ul>
                </li>
                <li>
                  Clique em{" "}
                  <span className="font-extrabold text-foreground">Save</span> e
                  realize um novo{" "}
                  <span className="font-extrabold text-foreground">
                    Redeploy
                  </span>{" "}
                  do projeto para aplicar as alterações!
                </li>
              </ol>
            </div>
          </div>
        </Card>
      )}

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
                  onClick={() =>
                    loadAdminData(
                      sessionStorage.getItem("admin_auth_token") || ""
                    )
                  }
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
