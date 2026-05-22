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
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(GeneratePlanSchema),
    defaultValues: {
      tema: initialValues?.tema || "",
      disciplina: initialValues?.disciplina || undefined,
      ano: initialValues?.ano || undefined,
      tempo: initialValues?.tempo || undefined,
      incluirPratica: initialValues?.incluirPratica || false,
      incluirAvaliacao: initialValues?.incluirAvaliacao || false,
      incluirTarefa: initialValues?.incluirTarefa || false,
    },
  });

  // Keep react-hook-form inputs reactive to asynchronously loaded initialValues
  useEffect(() => {
    if (initialValues) {
      reset({
        tema: initialValues.tema || "",
        disciplina: initialValues.disciplina || undefined,
        ano: initialValues.ano || undefined,
        tempo: initialValues.tempo || undefined,
        incluirPratica: initialValues.incluirPratica || false,
        incluirAvaliacao: initialValues.incluirAvaliacao || false,
        incluirTarefa: initialValues.incluirTarefa || false,
      });
    }
  }, [initialValues, reset]);

  const disciplinaValue = watch("disciplina");
  const anoValue = watch("ano");
  const tempoValue = watch("tempo");

  const onSubmit = (data: GeneratePlanInput) => {
    onGenerate(data);
  };

  const disciplinas = [
    "Português",
    "Matemática",
    "Ciências",
    "História",
    "Geografia",
    "Arte",
    "Educação Física",
  ];

  const anos = [
    "1º ano EF",
    "2º ano EF",
    "3º ano EF",
    "4º ano EF",
    "5º ano EF",
    "6º ano EF",
    "7º ano EF",
    "8º ano EF",
    "9º ano EF",
    "1º ano EM",
    "2º ano EM",
    "3º ano EM",
  ];

  const tempos = ["45min", "90min", "2 aulas de 45min"];

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
