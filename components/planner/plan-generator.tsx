"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sparkles,
  BrainCircuit,
  Compass,
  Clock,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

// Validating input fields schema
const GeneratePlanSchema = z.object({
  tema: z.string().min(3, "O tema deve ter pelo menos 3 caracteres"),
  disciplina: z.string().min(1, "Selecione uma disciplina"),
  ano: z.string().min(1, "Selecione o ano escolar"),
  tempo: z.string().min(1, "Selecione a duração recomendada"),
  necessidadeEspecial: z.string().default("regular"),
  incluirPratica: z.boolean().default(false),
  incluirAvaliacao: z.boolean().default(false),
  incluirTarefa: z.boolean().default(false),
});

type GeneratePlanInput = z.infer<typeof GeneratePlanSchema>;

interface PlanGeneratorProps {
  onGenerate: (data: GeneratePlanInput) => void;
  isLoading: boolean;
  initialValues?: {
    tema: string;
    disciplina: string;
    ano: string;
    tempo: string;
    necessidadeEspecial?: string;
    incluirPratica?: boolean;
    incluirAvaliacao?: boolean;
    incluirTarefa?: boolean;
  };
}

export function PlanGenerator({
  onGenerate,
  isLoading,
  initialValues,
}: PlanGeneratorProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      tema: initialValues?.tema || "",
      disciplina: initialValues?.disciplina || undefined,
      ano: initialValues?.ano || undefined,
      tempo: initialValues?.tempo || undefined,
      necessidadeEspecial: initialValues?.necessidadeEspecial || "regular",
      incluirPratica: initialValues?.incluirPratica || false,
      incluirAvaliacao: initialValues?.incluirAvaliacao || false,
      incluirTarefa: initialValues?.incluirTarefa || false,
    },
  });

  // Registra manualmente os campos dos dropdowns personalizados do Select
  useEffect(() => {
    register("disciplina");
    register("ano");
    register("tempo");
    register("necessidadeEspecial");
  }, [register]);

  // Keep react-hook-form inputs reactive to asynchronously loaded initialValues
  useEffect(() => {
    if (initialValues) {
      reset({
        tema: initialValues.tema || "",
        disciplina: initialValues.disciplina || undefined,
        ano: initialValues.ano || undefined,
        tempo: initialValues.tempo || undefined,
        necessidadeEspecial: initialValues.necessidadeEspecial || "regular",
        incluirPratica: initialValues.incluirPratica || false,
        incluirAvaliacao: initialValues.incluirAvaliacao || false,
        incluirTarefa: initialValues.incluirTarefa || false,
      });
    }
  }, [initialValues, reset]);

  const disciplinaValue = watch("disciplina");
  const anoValue = watch("ano");
  const tempoValue = watch("tempo");
  const necessidadeEspecialValue = watch("necessidadeEspecial");

  const onSubmit = (data: any) => {
    clearErrors();
    let hasError = false;

    if (!data.tema || data.tema.trim().length < 3) {
      setError("tema", {
        type: "manual",
        message: "O tema deve ter pelo menos 3 caracteres",
      });
      hasError = true;
    }
    if (!data.disciplina) {
      setError("disciplina", {
        type: "manual",
        message: "Selecione uma disciplina",
      });
      hasError = true;
    }
    if (!data.ano) {
      setError("ano", {
        type: "manual",
        message: "Selecione o ano escolar",
      });
      hasError = true;
    }
    if (!data.tempo) {
      setError("tempo", {
        type: "manual",
        message: "Selecione a duração recomendada",
      });
      hasError = true;
    }

    if (hasError) return;

    onGenerate(data);
  };

  const disciplinas = [
    "Português / Língua Portuguesa",
    "Matemática",
    "Ciências da Natureza",
    "Física",
    "Química",
    "Biologia",
    "História",
    "Geografia",
    "Sociologia",
    "Filosofia",
    "Arte / Educação Artística",
    "Educação Física",
    "Redação",
    "Literatura",
    "Inglês",
    "Espanhol",
    "Ensino Religioso",
    "Projeto de Vida",
    "Educação Financeira",
    "Tecnologia & Robótica",
    "Empreendedorismo",
  ];

  const anos = [
    "Educação Infantil (Maternal / Pré)",
    "1º ano EF (Ensino Fundamental I)",
    "2º ano EF (Ensino Fundamental I)",
    "3º ano EF (Ensino Fundamental I)",
    "4º ano EF (Ensino Fundamental I)",
    "5º ano EF (Ensino Fundamental I)",
    "6º ano EF (Ensino Fundamental II)",
    "7º ano EF (Ensino Fundamental II)",
    "8º ano EF (Ensino Fundamental II)",
    "9º ano EF (Ensino Fundamental II)",
    "1º ano EM (Ensino Médio)",
    "2º ano EM (Ensino Médio)",
    "3º ano EM (Ensino Médio)",
    "EJA (Educação de Jovens e Adultos)",
  ];

  const tempos = [
    "45min",
    "50min",
    "90min",
    "100min (Dobradinha)",
    "2 aulas de 45min",
    "3 aulas de 50min",
  ];

  const necessidadesEspeciais = [
    { value: "regular", label: "Nenhuma (Plano de Aula Regular)" },
    { value: "tdah", label: "TDAH (Déficit de Atenção/Hiperatividade)" },
    {
      value: "autismo",
      label: "Autismo / TEA (Transtorno do Espectro Autista)",
    },
    { value: "dislexia", label: "Dislexia e Transtornos de Leitura" },
    { value: "visual", label: "Deficiência Visual (Cegueira ou Baixa Visão)" },
    { value: "auditiva", label: "Deficiência Auditiva / Surdez" },
    { value: "intelectual", label: "Deficiência Intelectual / Cognitiva" },
    { value: "superdotacao", label: "Altas Habilidades / Superdotação" },
  ];

  return (
    <Card className="border-border bg-card shadow-2xl relative overflow-hidden rounded-2xl">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary" />

      <CardHeader className="space-y-2 pt-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BrainCircuit className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground">
          Criar Novo Plano de Aula com IA
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs sm:text-sm">
          A IA considerará a infraestrutura e o perfil cadastrados para a sua
          escola de forma inteligente.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          {/* Debug/Diagnostic area for form errors */}
          {Object.keys(errors).length > 0 && (
            <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/15 text-xs text-red-500 font-semibold space-y-1.5 animate-in fade-in duration-300">
              <p className="font-black uppercase tracking-wider text-[10px] text-red-600 mb-1">
                Erros de Validação Detectados:
              </p>
              {Object.entries(errors).map(([key, err]: any) => (
                <p key={key} className="flex items-center gap-1.5">
                  <span>•</span>
                  <span>
                    Campo <strong className="underline">{key}</strong>:{" "}
                    {err.message || "Valor inválido ou ausente."}
                  </span>
                </p>
              ))}
            </div>
          )}

          {/* Tema da Aula */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
              Tema Principal da Aula
            </label>
            <Input
              placeholder="Ex: Ciclo da água, Frações equivalentes, Revolução Francesa..."
              className="h-11 rounded-xl bg-background/50 border-border"
              disabled={isLoading}
              {...register("tema")}
            />
            {errors.tema?.message && (
              <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                {String(errors.tema.message)}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Disciplina */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Disciplina
              </label>
              <Select
                value={disciplinaValue}
                onValueChange={(val) => setValue("disciplina", val)}
                disabled={isLoading}
              >
                <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {disciplinas.map((disc) => (
                    <SelectItem key={disc} value={disc}>
                      {disc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.disciplina?.message && (
                <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                  {String(errors.disciplina.message)}
                </p>
              )}
            </div>

            {/* Ano Escolar */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Ano Escolar
              </label>
              <Select
                value={anoValue}
                onValueChange={(val) => setValue("ano", val)}
                disabled={isLoading}
              >
                <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {anos.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ano?.message && (
                <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                  {String(errors.ano.message)}
                </p>
              )}
            </div>

            {/* Tempo de Aula */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Tempo de Aula
              </label>
              <Select
                value={tempoValue}
                onValueChange={(val) => setValue("tempo", val)}
                disabled={isLoading}
              >
                <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {tempos.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tempo?.message && (
                <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                  {String(errors.tempo.message)}
                </p>
              )}
            </div>
          </div>

          {/* Necessidades Especiais (Inclusão Escolar) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block flex items-center gap-1.5">
              <span>Necessidades Especiais (Foco em Inclusão Pedagógica)</span>
              <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">
                Inclusivo
              </span>
            </label>
            <Select
              value={necessidadeEspecialValue}
              onValueChange={(val) => setValue("necessidadeEspecial", val)}
              disabled={isLoading}
            >
              <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border">
                <SelectValue placeholder="Selecione caso haja foco em inclusão escolar..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {necessidadesEspeciais.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Checkboxes Options */}
          <div className="pt-2 space-y-3">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
              Recursos e Incrementos Adicionais
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/80 hover:border-primary/20 bg-background/40 cursor-pointer select-none transition-all">
                <input
                  type="checkbox"
                  className="h-4.5 w-4.5 accent-primary cursor-pointer rounded"
                  disabled={isLoading}
                  {...register("incluirPratica")}
                />
                <span className="text-xs font-semibold text-foreground">
                  Incluir atividade prática
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/80 hover:border-primary/20 bg-background/40 cursor-pointer select-none transition-all">
                <input
                  type="checkbox"
                  className="h-4.5 w-4.5 accent-primary cursor-pointer rounded"
                  disabled={isLoading}
                  {...register("incluirAvaliacao")}
                />
                <span className="text-xs font-semibold text-foreground">
                  Incluir avaliação formativa
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/80 hover:border-primary/20 bg-background/40 cursor-pointer select-none transition-all">
                <input
                  type="checkbox"
                  className="h-4.5 w-4.5 accent-primary cursor-pointer rounded"
                  disabled={isLoading}
                  {...register("incluirTarefa")}
                />
                <span className="text-xs font-semibold text-foreground">
                  Incluir tarefa de casa
                </span>
              </label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/50 bg-muted/10 p-6 flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-primary/10 flex items-center justify-center gap-2 transition-all"
          >
            <span>Gerar Plano de Aula com IA</span>
            <Sparkles className="h-4 w-4 animate-pulse" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
