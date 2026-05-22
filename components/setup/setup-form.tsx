"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  Users2,
  BookOpen,
  Sparkles,
  Loader2,
  AlertCircle,
  Check,
  Save,
  FolderLock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Zod Validation Schema
const SchoolContextSchema = z.object({
  // Tab 1 - Infrastructure
  hasProjector: z.boolean().default(false),
  hasInternet: z.boolean().default(false),
  hasPatio: z.boolean().default(false),
  hasLibrary: z.boolean().default(false),
  studentsCount: z.enum(["15-20", "21-30", "31-40", "40+"], {
    message: "Selecione a quantidade de alunos",
  }),
  averageAge: z.enum(["3-4", "5-6", "7-8", "9-10", "11-14"], {
    message: "Selecione a idade média da turma",
  }),

  // Tab 2 - Class Profile
  hasSpecialNeeds: z.boolean().default(false),
  classCharacteristics: z
    .string()
    .min(5, "Descreva as características da turma (mínimo 5 caracteres)"),
  literacyLevel: z.enum(
    ["Pré-silábico", "Silábico", "Alfabético", "Avançado"],
    {
      message: "Selecione o nível de alfabetização",
    }
  ),

  // Tab 3 - BNCC Guidelines
  knowledgeArea: z.enum(
    ["Linguagens", "Matemática", "Ciências Humanas", "Ciências da Natureza"],
    {
      message: "Selecione a área do conhecimento",
    }
  ),
  schoolYear: z.string().min(1, "Selecione o ano escolar"),
  bnccSkills: z
    .array(z.string())
    .min(1, "Selecione pelo menos uma habilidade BNCC"),
});

type SchoolContextInput = z.infer<typeof SchoolContextSchema>;

// BNCC dynamic mapping database
const BNCC_SKILLS_MAP: Record<string, { code: string; desc: string }[]> = {
  "1º ano EF": [
    {
      code: "EF01LP01",
      desc: "Reconhecer que textos são lidos e escritos da esquerda para a direita.",
    },
    {
      code: "EF01MA01",
      desc: "Utilizar números naturais como indicador de quantidade ou de ordem.",
    },
    {
      code: "EF01CI01",
      desc: "Nomear as partes do corpo humano e explicar suas funções.",
    },
  ],
  "2º ano EF": [
    {
      code: "EF02LP04",
      desc: "Escrever grafando corretamente palavras com sílabas CV, V, CVC, CCV.",
    },
    {
      code: "EF02MA03",
      desc: "Comparar e ordenar números naturais pela compreensão de características.",
    },
    {
      code: "EF02CI03",
      desc: "Discutir a importância da água e da luz solar para a vida.",
    },
  ],
  "3º ano EF": [
    {
      code: "EF03LP08",
      desc: "Localizar informações explícitas em textos literários ou informativos.",
    },
    {
      code: "EF03MA06",
      desc: "Resolver e elaborar problemas de adição e subtração com números naturais.",
    },
    {
      code: "EF03CI04",
      desc: "Identificar características sobre a produção do som e efeitos da luz.",
    },
  ],
  "4º ano EF": [
    {
      code: "EF04LP10",
      desc: "Ler e compreender, com autonomia, cartas de reclamação e petições.",
    },
    {
      code: "EF04MA10",
      desc: "Reconhecer frações como representação de partes de um todo dividido.",
    },
    {
      code: "EF04CI06",
      desc: "Relacionar a participação de fungos e bactérias no ciclo da matéria.",
    },
  ],
  "5º ano EF": [
    {
      code: "EF05LP15",
      desc: "Distinguir fatos de opiniões em textos jornalísticos e informativos.",
    },
    {
      code: "EF05MA15",
      desc: "Reconhecer, nomear e comparar figuras geométricas espaciais.",
    },
    {
      code: "EF05CI08",
      desc: "Organizar um cardápio equilibrado com base nas necessidades nutricionais.",
    },
  ],
  "6º ano EF": [
    {
      code: "EF06LP05",
      desc: "Identificar a função de gêneros jornalísticos diversos.",
    },
    {
      code: "EF06MA02",
      desc: "Reconhecer o sistema de numeração decimal e operações com frações.",
    },
    {
      code: "EF06CI02",
      desc: "Associar a estrutura da célula como unidade fundamental da vida.",
    },
  ],
  "7º ano EF": [
    {
      code: "EF07LP09",
      desc: "Utilizar advérbios e conjunções para articular coesão textual.",
    },
    {
      code: "EF07MA12",
      desc: "Resolver equações polinomiais de 1º grau associadas a problemas.",
    },
    {
      code: "EF07CI05",
      desc: "Discutir a biodiversidade brasileira e biomas característicos.",
    },
  ],
  "8º ano EF": [
    {
      code: "EF08LP12",
      desc: "Produzir artigos de opinião defendendo pontos de vista claros.",
    },
    {
      code: "EF08MA15",
      desc: "Calcular e avaliar medidas de tendência central em estatística.",
    },
    {
      code: "EF08CI08",
      desc: "Analisar dados climáticos e prever mudanças no tempo atmosférico.",
    },
  ],
  "9º ano EF": [
    {
      code: "EF09LP18",
      desc: "Analisar a recepção e circulação de discursos em ambientes digitais.",
    },
    {
      code: "EF09MA20",
      desc: "Calcular a probabilidade de eventos aleatórios e frequências.",
    },
    {
      code: "EF09CI11",
      desc: "Discutir a evolução biológica com base nas teorias de seleção natural.",
    },
  ],
  "1º ano EM": [
    {
      code: "EM13LGG101",
      desc: "Compreender o funcionamento das linguagens em mídias digitais.",
    },
    {
      code: "EM13MAT101",
      desc: "Interpretar e propor equações de modelagem matemática no cotidiano.",
    },
  ],
  "2º ano EM": [
    {
      code: "EM13CHS101",
      desc: "Analisar a formação de sociedades, territórios e fronteiras geopolíticas.",
    },
  ],
  "3º ano EM": [
    {
      code: "EM13CNT101",
      desc: "Propor e testar hipóteses sobre transformações físicas e químicas da matéria.",
    },
  ],
};

export function SetupForm() {
  const [activeTab, setActiveTab] = useState<"infra" | "profile" | "bncc">(
    "infra"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(SchoolContextSchema),
    defaultValues: {
      hasProjector: false,
      hasInternet: false,
      hasPatio: false,
      hasLibrary: false,
      studentsCount: undefined,
      averageAge: undefined,
      hasSpecialNeeds: false,
      classCharacteristics: "",
      literacyLevel: undefined,
      knowledgeArea: undefined,
      schoolYear: undefined,
      bnccSkills: [],
    },
  });

  const studentsCountValue = watch("studentsCount");
  const averageAgeValue = watch("averageAge");
  const literacyLevelValue = watch("literacyLevel");
  const knowledgeAreaValue = watch("knowledgeArea");
  const schoolYearValue = watch("schoolYear");
  const selectedSkills = watch("bnccSkills") || [];

  // Dynamic BNCC Skills options based on chosen Year
  const availableSkills = schoolYearValue
    ? BNCC_SKILLS_MAP[schoolYearValue] || []
    : [];

  // Automatically reset selected BNCC skills if school year changes
  useEffect(() => {
    setValue("bnccSkills", []);
  }, [schoolYearValue, setValue]);

  const handleSkillToggle = (code: string) => {
    if (selectedSkills.includes(code)) {
      setValue(
        "bnccSkills",
        selectedSkills.filter((s: string) => s !== code)
      );
    } else {
      setValue("bnccSkills", [...selectedSkills, code]);
    }
  };

  const handleSaveToSupabase = async (
    formData: Partial<SchoolContextInput>,
    isDraft: boolean
  ) => {
    if (isDraft) {
      setIsDrafting(true);
    } else {
      setIsSaving(true);
    }
    setError(null);
    setSuccess(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "Você precisa estar autenticado para salvar as configurações."
        );
      }

      // Format payload for SQL insert/upsert
      const payload = {
        user_id: user.id,
        has_projector: formData.hasProjector ?? false,
        has_internet: formData.hasInternet ?? false,
        has_patio: formData.hasPatio ?? false,
        has_library: formData.hasLibrary ?? false,
        students_count: formData.studentsCount || "15-20",
        average_age: formData.averageAge || "5-6",
        has_special_needs: formData.hasSpecialNeeds ?? false,
        class_characteristics:
          formData.classCharacteristics || "Rascunho inicial",
        literacy_level: formData.literacyLevel || "Silábico",
        knowledge_area: formData.knowledgeArea || "Linguagens",
        school_year: formData.schoolYear || "1º ano EF",
        bncc_skills: formData.bnccSkills || [],
        is_draft: isDraft,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from("school_context")
        .upsert(payload, { onConflict: "user_id" });

      if (upsertError) throw upsertError;

      setSuccess(
        isDraft
          ? "Rascunho de configurações salvo com sucesso!"
          : "Configurações completas da escola salvas com sucesso! Redirecionando..."
      );

      if (!isDraft) {
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err: any) {
      console.error("Erro ao salvar no Supabase:", err);
      setError(
        err.message ||
          "Falha de conexão com o banco de dados. Tente novamente mais tarde."
      );
    } finally {
      setIsSaving(false);
      setIsDrafting(false);
    }
  };

  const onFullSubmit = (data: SchoolContextInput) => {
    handleSaveToSupabase(data, false);
  };

  const onSaveDraft = () => {
    // Gather whatever values are currently watched to save as draft, bypassing Zod validation requirements
    const currentValues = {
      hasProjector: watch("hasProjector"),
      hasInternet: watch("hasInternet"),
      hasPatio: watch("hasPatio"),
      hasLibrary: watch("hasLibrary"),
      studentsCount: watch("studentsCount"),
      averageAge: watch("averageAge"),
      hasSpecialNeeds: watch("hasSpecialNeeds"),
      classCharacteristics: watch("classCharacteristics"),
      literacyLevel: watch("literacyLevel"),
      knowledgeArea: watch("knowledgeArea"),
      schoolYear: watch("schoolYear"),
      bnccSkills: watch("bnccSkills"),
    };
    handleSaveToSupabase(currentValues, true);
  };

  // Helper validation indicator: Returns true if any field in that specific tab has validation errors
  const hasInfraErrors = !!(errors.studentsCount || errors.averageAge);
  const hasProfileErrors = !!(
    errors.classCharacteristics || errors.literacyLevel
  );
  const hasBnccErrors = !!(
    errors.knowledgeArea ||
    errors.schoolYear ||
    errors.bnccSkills
  );

  return (
    <Card className="border-border bg-card shadow-2xl relative overflow-hidden rounded-2xl">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary" />

      {/* Tabs Navigation Header */}
      <div className="flex border-b border-border bg-muted/20">
        <button
          type="button"
          onClick={() => setActiveTab("infra")}
          className={`flex-1 py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === "infra"
              ? "border-primary text-primary bg-background/50"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
          }`}
        >
          <Building2
            className={`h-4 w-4 ${hasInfraErrors ? "text-red-500 animate-pulse" : ""}`}
          />
          <span>1. Infraestrutura</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === "profile"
              ? "border-primary text-primary bg-background/50"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
          }`}
        >
          <Users2
            className={`h-4 w-4 ${hasProfileErrors ? "text-red-500 animate-pulse" : ""}`}
          />
          <span>2. Perfil da Turma</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bncc")}
          className={`flex-1 py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === "bncc"
              ? "border-primary text-primary bg-background/50"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
          }`}
        >
          <BookOpen
            className={`h-4 w-4 ${hasBnccErrors ? "text-red-500 animate-pulse" : ""}`}
          />
          <span>3. Diretrizes BNCC</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onFullSubmit)}>
        <CardContent className="p-6 space-y-6 min-h-[350px]">
          {error && (
            <Alert
              variant="destructive"
              className="rounded-xl shadow-sm border-red-500/20 bg-red-500/5 animate-in shake duration-300"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Ocorreu um erro</AlertTitle>
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600 rounded-xl shadow-sm animate-in zoom-in-95 duration-300">
              <Check className="h-4 w-4 text-emerald-600" />
              <AlertTitle className="font-bold">Ação concluída</AlertTitle>
              <AlertDescription className="text-xs text-emerald-700/80">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* TAB 1: INFRASTRUCTURE */}
          {activeTab === "infra" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span>Instalações & Recursos</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Informe o que a sua sala de aula e escola possuem de recursos
                físicos utilizáveis.
              </p>

              {/* Checkboxes Grid */}
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/80 hover:border-primary/20 bg-background/40 cursor-pointer select-none transition-all">
                  <input
                    type="checkbox"
                    className="h-4.5 w-4.5 accent-primary cursor-pointer rounded"
                    {...register("hasProjector")}
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Tem projetor/TV na sala
                  </span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/80 hover:border-primary/20 bg-background/40 cursor-pointer select-none transition-all">
                  <input
                    type="checkbox"
                    className="h-4.5 w-4.5 accent-primary cursor-pointer rounded"
                    {...register("hasInternet")}
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Tem acesso à internet na sala
                  </span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/80 hover:border-primary/20 bg-background/40 cursor-pointer select-none transition-all">
                  <input
                    type="checkbox"
                    className="h-4.5 w-4.5 accent-primary cursor-pointer rounded"
                    {...register("hasPatio")}
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Tem pátio aberto para atividades
                  </span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/80 hover:border-primary/20 bg-background/40 cursor-pointer select-none transition-all">
                  <input
                    type="checkbox"
                    className="h-4.5 w-4.5 accent-primary cursor-pointer rounded"
                    {...register("hasLibrary")}
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Tem biblioteca na escola
                  </span>
                </label>
              </div>

              {/* Select Grid */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Número de Alunos na Turma
                  </label>
                  <Select
                    value={studentsCountValue}
                    onValueChange={(val) =>
                      setValue("studentsCount", val as any)
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="15-20">15 a 20 alunos</SelectItem>
                      <SelectItem value="21-30">21 a 30 alunos</SelectItem>
                      <SelectItem value="31-40">31 a 40 alunos</SelectItem>
                      <SelectItem value="40+">Mais de 40 alunos</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.studentsCount?.message && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                      {String(errors.studentsCount.message)}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Idade Média dos Alunos
                  </label>
                  <Select
                    value={averageAgeValue}
                    onValueChange={(val) => setValue("averageAge", val as any)}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="3-4">
                        3 a 4 anos (Educação Infantil)
                      </SelectItem>
                      <SelectItem value="5-6">5 a 6 anos</SelectItem>
                      <SelectItem value="7-8">7 a 8 anos</SelectItem>
                      <SelectItem value="9-10">9 a 10 anos</SelectItem>
                      <SelectItem value="11-14">
                        11 a 14 anos (Ensino Fundamental II)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.averageAge?.message && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                      {String(errors.averageAge.message)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLASS PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Users2 className="h-5 w-5 text-primary" />
                <span>Perfil & Diagnóstico</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Informe as principais características intelectuais e sociais que
                definem o comportamento da sua turma.
              </p>

              {/* Special Needs inclusion */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/80 hover:border-primary/20 bg-background/40 cursor-pointer select-none transition-all">
                <input
                  type="checkbox"
                  className="h-4.5 w-4.5 accent-primary cursor-pointer rounded"
                  {...register("hasSpecialNeeds")}
                />
                <span className="text-xs font-semibold text-foreground">
                  Alunos com necessidades especiais (Inclusão)
                </span>
              </label>

              {/* Class Characteristics */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Características Gerais da Turma
                </label>
                <Input
                  placeholder="Ex: Alunos muito agitados após o recreio, turma muito avançada em leitura e vocabulário."
                  className="h-11 rounded-xl bg-background/50 border-border"
                  {...register("classCharacteristics")}
                />
                {errors.classCharacteristics?.message && (
                  <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                    {String(errors.classCharacteristics.message)}
                  </p>
                )}
              </div>

              {/* Literacy Level Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Nível Médio de Alfabetização
                </label>
                <Select
                  value={literacyLevelValue}
                  onValueChange={(val) => setValue("literacyLevel", val as any)}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Pré-silábico">Pré-silábico</SelectItem>
                    <SelectItem value="Silábico">Silábico</SelectItem>
                    <SelectItem value="Alfabético">Alfabético</SelectItem>
                    <SelectItem value="Avançado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
                {errors.literacyLevel?.message && (
                  <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                    {String(errors.literacyLevel.message)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BNCC DIRECTIVES */}
          {activeTab === "bncc" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>Base Nacional Comum Curricular (BNCC)</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Selecione o ano letivo e filtre as habilidades curriculares
                prioritárias recomendadas pela BNCC.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Knowledge Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Área do Conhecimento
                  </label>
                  <Select
                    value={knowledgeAreaValue}
                    onValueChange={(val) =>
                      setValue("knowledgeArea", val as any)
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Linguagens">
                        Linguagens (Português, Artes, Ed. Física)
                      </SelectItem>
                      <SelectItem value="Matemática">Matemática</SelectItem>
                      <SelectItem value="Ciências Humanas">
                        Ciências Humanas (História, Geografia)
                      </SelectItem>
                      <SelectItem value="Ciências da Natureza">
                        Ciências da Natureza (Biologia, Física, Química)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.knowledgeArea?.message && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                      {String(errors.knowledgeArea.message)}
                    </p>
                  )}
                </div>

                {/* School Year Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Ano Escolar
                  </label>
                  <Select
                    value={schoolYearValue}
                    onValueChange={(val) => setValue("schoolYear", val)}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border">
                      <SelectValue placeholder="Selecione o ano escolar..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="1º ano EF">
                        1º ano EF (Ensino Fundamental)
                      </SelectItem>
                      <SelectItem value="2º ano EF">2º ano EF</SelectItem>
                      <SelectItem value="3º ano EF">3º ano EF</SelectItem>
                      <SelectItem value="4º ano EF">4º ano EF</SelectItem>
                      <SelectItem value="5º ano EF">5º ano EF</SelectItem>
                      <SelectItem value="6º ano EF">6º ano EF</SelectItem>
                      <SelectItem value="7º ano EF">7º ano EF</SelectItem>
                      <SelectItem value="8º ano EF">8º ano EF</SelectItem>
                      <SelectItem value="9º ano EF">9º ano EF</SelectItem>
                      <SelectItem value="1º ano EM">
                        1º ano EM (Ensino Médio)
                      </SelectItem>
                      <SelectItem value="2º ano EM">2º ano EM</SelectItem>
                      <SelectItem value="3º ano EM">3º ano EM</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.schoolYear?.message && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                      {String(errors.schoolYear.message)}
                    </p>
                  )}
                </div>
              </div>

              {/* Dynamic BNCC Skills List */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Habilidades BNCC Prioritárias do Ano
                </label>

                {!schoolYearValue ? (
                  <div className="text-center py-6 border border-dashed border-border rounded-xl bg-muted/5 text-muted-foreground text-xs font-semibold">
                    Escolha o Ano Escolar acima para carregar as habilidades
                    curriculares correspondentes.
                  </div>
                ) : (
                  <div className="grid gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {availableSkills.map((skill) => {
                      const isChecked = selectedSkills.includes(skill.code);
                      return (
                        <div
                          key={skill.code}
                          onClick={() => handleSkillToggle(skill.code)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 text-left items-start ${
                            isChecked
                              ? "border-primary bg-primary/5"
                              : "border-border/60 hover:border-primary/20 bg-background/50 hover:bg-muted/10"
                          }`}
                        >
                          <div
                            className={`h-4.5 w-4.5 shrink-0 rounded border flex items-center justify-center mt-0.5 transition-all ${
                              isChecked
                                ? "bg-primary border-primary text-white"
                                : "border-muted-foreground/35 bg-white"
                            }`}
                          >
                            {isChecked && (
                              <Check className="h-3 w-3 text-white stroke-[3px]" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-extrabold text-primary uppercase tracking-wider">
                              {skill.code}
                            </span>
                            <p className="text-[11px] sm:text-xs text-foreground/80 font-medium leading-relaxed">
                              {skill.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {errors.bnccSkills?.message && (
                  <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                    {String(errors.bnccSkills.message)}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-border/50 bg-muted/10 p-6 flex flex-col sm:flex-row justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving || isDrafting}
            onClick={onSaveDraft}
            className="w-full sm:w-auto h-11 border-border bg-background hover:bg-muted/30 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {isDrafting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4 text-muted-foreground" />
            )}
            <span>Editar depois (Salvar Rascunho)</span>
          </Button>

          <div className="flex gap-3 w-full sm:w-auto">
            {activeTab !== "infra" && (
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setActiveTab(activeTab === "bncc" ? "profile" : "infra")
                }
                className="h-11 px-5 rounded-xl font-bold flex-1 sm:flex-none"
              >
                Anterior
              </Button>
            )}

            {activeTab !== "bncc" ? (
              <Button
                type="button"
                onClick={() =>
                  setActiveTab(activeTab === "infra" ? "profile" : "bncc")
                }
                className="bg-primary hover:bg-primary/95 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-primary/10 flex-1 sm:flex-none"
              >
                Próxima Etapa
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSaving || isDrafting}
                className="bg-primary hover:bg-primary/95 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-primary/10 flex items-center justify-center gap-2 flex-1 sm:flex-none group transition-all"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Salvar e Continuar</span>
                    <Check className="h-4 w-4 transition-transform group-hover:scale-110" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
