"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeButton } from "@/components/planner/upgrade-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sidebar } from "@/components/layout/sidebar";
import { PlanGenerator } from "@/components/planner/plan-generator";
import { PlanDisplay } from "@/components/planner/plan-display";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PlannerPage() {
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [initialFormValues, setInitialFormValues] = useState<any>(undefined);
  const { isLimitReached } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Hook for parsing URL query parameters for Reopen / Duplicate
  useEffect(() => {
    const fetchPlanFromParams = async () => {
      const reopenId = searchParams.get("reopen");
      const duplicateId = searchParams.get("duplicate");

      const useMockDemo =
        typeof window !== "undefined" &&
        (localStorage.getItem("use_mock_demo") === "true" ||
          document.cookie.includes("use_mock_demo=true"));

      if (reopenId) {
        setIsLoading(true);
        setError(null);
        try {
          let planToReopen = null;

          if (useMockDemo) {
            const localPlansStr =
              localStorage.getItem("mock_lesson_plans") || "[]";
            const localPlans = JSON.parse(localPlansStr);
            planToReopen = localPlans.find((p: any) => p.id === reopenId);
            if (!planToReopen) {
              throw new Error(
                "Plano de aula nao encontrado no historico local."
              );
            }
          } else {
            const { data, error: fetchErr } = await supabase
              .from("lesson_plans")
              .select("*")
              .eq("id", reopenId)
              .single();

            if (fetchErr || !data)
              throw new Error("Plano de aula nao encontrado no historico.");
            planToReopen = data;
          }

          setQueryParams({
            tema: planToReopen.theme,
            disciplina: planToReopen.subject,
            ano: planToReopen.grade,
            tempo: planToReopen.duration,
          });
          setGeneratedPlan(planToReopen.plan_data);
        } catch (err: any) {
          setError(err.message || "Erro ao reabrir plano de aula.");
        } finally {
          setIsLoading(false);
        }
      } else if (duplicateId) {
        setIsLoading(true);
        setError(null);
        try {
          let planToDuplicate = null;

          if (useMockDemo) {
            const localPlansStr =
              localStorage.getItem("mock_lesson_plans") || "[]";
            const localPlans = JSON.parse(localPlansStr);
            planToDuplicate = localPlans.find((p: any) => p.id === duplicateId);
            if (!planToDuplicate) {
              throw new Error(
                "Plano de aula nao encontrado no historico local."
              );
            }
          } else {
            const { data, error: fetchErr } = await supabase
              .from("lesson_plans")
              .select("*")
              .eq("id", duplicateId)
              .single();

            if (fetchErr || !data)
              throw new Error("Plano de aula nao encontrado para duplicar.");
            planToDuplicate = data;
          }

          setInitialFormValues({
            tema: `${planToDuplicate.theme} (Copia)`,
            disciplina: planToDuplicate.subject,
            ano: planToDuplicate.grade,
            tempo: planToDuplicate.duration,
          });
        } catch (err: any) {
          setError(err.message || "Erro ao carregar copia do plano de aula.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPlanFromParams();
  }, [searchParams]);

  // Form params to pass down to PlanDisplay for block custom-regerações
  const [queryParams, setQueryParams] = useState<any>({
    tema: "",
    disciplina: "",
    ano: "",
    tempo: "",
  });

  const loadingMessages = [
    "Analisando habilidades da BNCC...",
    "Criando objetivos de aprendizagem...",
    "Desenvolvendo atividades contextualizadas...",
    "Finalizando planejamento...",
  ];

  // Rotate through loader steps during AI generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGeneratePlan = async (formData: any) => {
    if (isLimitReached) {
      setShowUpgradeModal(true);
      return;
    }
    setIsLoading(true);
    setError(null);
    setLoadingStep(0);
    setQueryParams({
      tema: formData.tema,
      disciplina: formData.disciplina,
      ano: formData.ano,
      tempo: formData.tempo,
    });

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error || "Ocorreu um erro ao gerar o plano de aula."
        );
      }

      if (data.plan) {
        setGeneratedPlan(data.plan);
        try {
          const useMockDemo =
            typeof window !== "undefined" &&
            (localStorage.getItem("use_mock_demo") === "true" ||
              document.cookie.includes("use_mock_demo=true"));

          if (useMockDemo) {
            // Save to browser localStorage simulating database
            const localPlansStr =
              localStorage.getItem("mock_lesson_plans") || "[]";
            const localPlans = JSON.parse(localPlansStr);
            const newPlan = {
              id: `plan-mock-${Date.now()}`,
              user_id: "mock-user-id-teacher",
              title: data.plan.titulo,
              theme: formData.tema,
              subject: formData.disciplina,
              grade: formData.ano,
              duration: formData.tempo,
              plan_data: data.plan,
              created_at: new Date().toISOString(),
            };
            localPlans.unshift(newPlan);
            localStorage.setItem(
              "mock_lesson_plans",
              JSON.stringify(localPlans)
            );
            console.log(
              "Plano salvo com sucesso no LocalStorage do visitante!"
            );
          } else {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (user) {
              await supabase.from("lesson_plans").insert({
                user_id: user.id,
                title: data.plan.titulo,
                theme: formData.tema,
                subject: formData.disciplina,
                grade: formData.ano,
                duration: formData.tempo,
                plan_data: data.plan,
              });
            }
          }
        } catch (saveErr) {
          console.error(
            "Erro ao salvar automaticamente no historico:",
            saveErr
          );
        }
      } else {
        throw new Error("Resposta de plano de aula inválida.");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Falha de conexão ao servidor ou limite de requisições do Gemini atingido. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedPlan(null);
    setError(null);
  };

  return (
    <div className="flex-1 flex bg-background min-h-screen">
      {/* Navigation Sidebar panel */}
      <Sidebar />

      {/* Main workspace container */}
      <div className="flex-grow p-4 sm:p-8 overflow-y-auto space-y-6 max-w-6xl mx-auto w-full animate-in fade-in duration-500 pb-16">
        {/* Navigation back helper in plan view */}
        {generatedPlan && (
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="rounded-xl flex items-center gap-2 border-border hover:border-primary/20 bg-background shadow-sm text-xs font-bold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Criar Outro Plano</span>
            </Button>

            <Badge className="bg-primary/5 text-primary border-primary/10 font-extrabold text-[10px] tracking-wider uppercase">
              Modo Visualização
            </Badge>
          </div>
        )}

        {/* Introduction Panel */}
        {!generatedPlan && !isLoading && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Planejador de Aulas Inteligente
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Crie planos de aulas contextualizados em segundos. Nossa
              inteligência artificial se encarrega de mapear as diretrizes da
              BNCC e adequar as atividades físicas ou teóricas à realidade
              estrutural da sua escola.
            </p>
          </div>
        )}

        {error && (
          <Alert
            variant="destructive"
            className="rounded-2xl shadow-md border-red-500/20 bg-red-500/5 animate-in shake duration-300"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Ocorreu um erro</AlertTitle>
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* LOADING PROGRESS MODIFIER CARD */}
        {isLoading ? (
          <Card className="border-border bg-card shadow-2xl py-20 text-center rounded-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] animate-in zoom-in-95 duration-500">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary animate-pulse" />

            {/* Spinning glowing loader icon */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute h-14 w-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-foreground transition-all duration-500 animate-pulse tracking-tight max-w-sm px-4">
              {loadingMessages[loadingStep]}
            </h3>

            <p className="text-xs text-muted-foreground max-w-xs mt-2.5 leading-relaxed font-medium px-4">
              Aguarde alguns segundos. O Gemini está combinando a BNCC com as
              diretrizes e recursos de infraestrutura da sua escola.
            </p>
          </Card>
        ) : generatedPlan ? (
          /* Lesson Plan Renderer */
          <PlanDisplay
            plan={generatedPlan}
            tema={queryParams.tema}
            disciplina={queryParams.disciplina}
            ano={queryParams.ano}
            tempoTotal={queryParams.tempo}
          />
        ) : (
          /* Generation preference collection form */
          <PlanGenerator
            onGenerate={handleGeneratePlan}
            isLoading={isLoading}
            initialValues={initialFormValues}
          />
        )}

        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="sm:max-w-[420px] p-6 rounded-3xl border-2 border-primary/20 bg-card shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
            <DialogHeader className="space-y-3">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <DialogTitle className="text-xl font-black text-foreground tracking-tight">
                Limite Mensal Atingido!
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold leading-relaxed text-muted-foreground">
                Voce atingiu o limite maximo de 3 planos de aulas gratuitos por
                mes. Faca o upgrade para o plano Pro para criar planejamentos
                ilimitados, gerar atividades praticas e baixar PDFs sem marcas
                d&apos;agua!
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-3">
              <UpgradeButton
                priceId={
                  process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ||
                  "price_1ProMonthly"
                }
                planTier="pro"
              >
                Assinar Plano Pro (R$ 29/mes)
              </UpgradeButton>
              <Button
                variant="ghost"
                onClick={() => setShowUpgradeModal(false)}
                className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground h-10 rounded-xl"
              >
                Voltar mais tarde
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
