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

  const loadAdminData = async (pwd: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin", {
        headers: {
          "x-admin-password": pwd,
        },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem("admin_auth_token");
        throw new Error("Senha administrativa incorreta.");
      }

      const data = await res.json();
      if (data.error) {
        setServerError(data.error);
        throw new Error(data.error);
      }

      if (data.isConfigured === false) {
        setServerError(
          `A variável de ambiente 'SUPABASE_SERVICE_ROLE_KEY' não está configurada no seu servidor da Vercel. Chaves de ambiente contendo SUPABASE/ROLE detectadas: ${JSON.stringify(
            data.debugKeys || []
          )}.`
        );
      } else {
        setServerError(null);
      }

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
        title: "Erro de Conexão",
        description: e.message || "Erro ao carregar dados do painel admin.",
        variant: "destructive",
      });
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cachedToken = sessionStorage.getItem("admin_auth_token") || "";
    if (cachedToken) {
      loadAdminData(cachedToken).catch(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingPassword(true);
    try {
      await loadAdminData(enteredPassword);
      sessionStorage.setItem("admin_auth_token", enteredPassword);
      toast({
        title: "Acesso Autorizado",
        description: "Conexão administrativa segura estabelecida com sucesso!",
      });
    } catch (err) {
      // Handled inside loadAdminData
    } finally {
      setIsCheckingPassword(false);
    }
  };

  const handleUpdatePlanTier = async (userId: string, newTier: string) => {
    try {
      const token = sessionStorage.getItem("admin_auth_token") || "";
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": token,
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
      await loadAdminData(token);
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
              {isLoading ? (
                <div className="h-9 w-16 bg-muted animate-pulse rounded-lg mt-0.5" />
              ) : (
                stats.totalUsers
              )}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1">
              Contas reais ativas no Supabase Auth
            </p>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="border border-border/80 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 h-20 w-20 bg-violet-600/5 rounded-full blur-xl group-hover:bg-violet-600/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Planos de Aula Gerados
            </CardTitle>
            <FileText className="h-5 w-5 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {isLoading ? (
                <div className="h-9 w-16 bg-muted animate-pulse rounded-lg mt-0.5" />
              ) : (
                stats.totalPlans
              )}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1">
              Aulas salvas no banco postgresql
            </p>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border border-border/80 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 h-20 w-20 bg-emerald-600/5 rounded-full blur-xl group-hover:bg-emerald-600/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Assinantes Ativos
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground flex items-baseline gap-2">
              {isLoading ? (
                <div className="h-9 w-24 bg-muted animate-pulse rounded-lg mt-0.5" />
              ) : (
                <>
                  <span>{stats.activeSubsPro + stats.activeSubsSchool}</span>
                  <span className="text-xs font-bold text-muted-foreground">
                    ({stats.activeSubsPro} Pro / {stats.activeSubsSchool}{" "}
                    Escola)
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1">
              Controle de receita recorrente ativa
            </p>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="border border-border/80 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 h-20 w-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              MRR Estimado
            </CardTitle>
            <DollarSign className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {isLoading ? (
                <div className="h-9 w-20 bg-muted animate-pulse rounded-lg mt-0.5" />
              ) : (
                `R$ ${stats.estimatedMrr.toFixed(2)}`
              )}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1">
              Métrica baseada nas assinaturas ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs / Tables */}
      <div className="space-y-6">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex gap-2 p-1 bg-muted/60 rounded-xl border border-border/80 self-start">
            <Button
              size="sm"
              variant={activeTab === "users" ? "default" : "ghost"}
              onClick={() => setActiveTab("users")}
              className="rounded-lg font-black text-xs uppercase"
            >
              Lista de Professores ({users.length})
            </Button>
            <Button
              size="sm"
              variant={activeTab === "plans" ? "default" : "ghost"}
              onClick={() => setActiveTab("plans")}
              className="rounded-lg font-black text-xs uppercase"
            >
              Planos de Aula Gerados ({plans.length})
            </Button>
          </div>

          {/* Search Inputs */}
          <div className="flex items-center gap-3">
            {activeTab === "users" ? (
              <>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar professor por email..."
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl bg-card border-border"
                  />
                </div>

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
              </>
            ) : (
              <>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar por tema, matéria ou autor..."
                    value={searchPlanQuery}
                    onChange={(e) => setSearchPlanQuery(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl bg-card border-border"
                  />
                </div>

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
              </>
            )}
          </div>
        </div>

        {/* Tab 1: Users table */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Table Container */}
            <div className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground text-[10px] sm:text-xs font-black uppercase tracking-wider">
                    <th className="p-4 pl-6">Email do Professor</th>
                    <th className="p-4">Membro Desde</th>
                    <th className="p-4">Último Login</th>
                    <th className="p-4 text-center">Planos Gerados</th>
                    <th className="p-4">Assinatura Atual</th>
                    <th className="p-4 text-right pr-6">Ações de Controle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm font-bold">
                          <RotateCw className="h-4 w-4 animate-spin text-primary" />
                          <span>Carregando dados dos professores...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-12 text-center text-muted-foreground text-xs font-bold"
                      >
                        Nenhum professor encontrado correspondente aos
                        critérios.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-muted/20 transition-colors text-xs font-semibold text-foreground/90"
                      >
                        <td className="p-4 pl-6 font-bold text-foreground">
                          {u.email}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {u.last_sign_in_at
                            ? new Date(u.last_sign_in_at).toLocaleString(
                                "pt-BR"
                              )
                            : "Nunca"}
                        </td>
                        <td className="p-4 text-center">
                          <Badge
                            variant="secondary"
                            className="px-2 py-0.5 rounded-lg bg-muted border border-border font-bold"
                          >
                            {u.plans_count}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={`px-2.5 py-0.5 rounded-lg font-black text-[10px] uppercase border tracking-wider ${
                              u.plan_tier === "pro"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                : u.plan_tier === "school"
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                  : "bg-muted border-border text-muted-foreground"
                            }`}
                          >
                            {u.plan_tier === "pro"
                              ? "Mensal (Pro)"
                              : u.plan_tier === "school"
                                ? "Parceiro (Escola)"
                                : "Gratuito"}
                          </Badge>
                        </td>
                        <td className="p-4 text-right pr-6">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="xs"
                              variant="outline"
                              disabled={u.plan_tier === "free"}
                              onClick={() => handleUpdatePlanTier(u.id, "free")}
                              className="text-[10px] h-7 font-black border-red-500/20 hover:bg-red-500/10 hover:text-red-500 text-red-400 rounded-lg px-2"
                            >
                              Revogar
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              disabled={u.plan_tier === "pro"}
                              onClick={() => handleUpdatePlanTier(u.id, "pro")}
                              className="text-[10px] h-7 font-black border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 text-emerald-400 rounded-lg px-2"
                            >
                              Ativar Pro
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              disabled={u.plan_tier === "school"}
                              onClick={() =>
                                handleUpdatePlanTier(u.id, "school")
                              }
                              className="text-[10px] h-7 font-black border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500 text-amber-400 rounded-lg px-2"
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

        {/* Tab 2: Plans table */}
        {activeTab === "plans" && (
          <div className="space-y-4">
            {/* Table Container */}
            <div className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground text-[10px] sm:text-xs font-black uppercase tracking-wider">
                    <th className="p-4 pl-6">Tema do Plano</th>
                    <th className="p-4">Matéria</th>
                    <th className="p-4">Ano Escolar</th>
                    <th className="p-4">Duração</th>
                    <th className="p-4">Autor (Professor)</th>
                    <th className="p-4 text-right pr-6">Data de Criação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm font-bold">
                          <RotateCw className="h-4 w-4 animate-spin text-primary" />
                          <span>Carregando lista de planos de aula...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPlans.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-12 text-center text-muted-foreground text-xs font-bold"
                      >
                        Nenhum plano de aula encontrado correspondente aos
                        critérios.
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-muted/20 transition-colors text-xs font-semibold text-foreground/90"
                      >
                        <td className="p-4 pl-6 font-bold text-foreground max-w-xs truncate">
                          {p.theme}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {p.subject}
                        </td>
                        <td className="p-4 text-muted-foreground">{p.grade}</td>
                        <td className="p-4 text-muted-foreground">
                          {p.duration}
                        </td>
                        <td className="p-4 text-primary font-bold">
                          {p.user_email}
                        </td>
                        <td className="p-4 text-right pr-6 text-muted-foreground">
                          {new Date(p.created_at).toLocaleString("pt-BR")}
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

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-xl max-w-sm bg-slate-900 border-white/10 text-white animate-in slide-in-from-bottom-5">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 text-left">
              <h4 className="font-black text-xs uppercase tracking-wide text-white">
                {toastMessage.title}
              </h4>
              <p className="text-[11px] font-bold text-slate-300 leading-relaxed">
                {toastMessage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
