"use client";

import { useState } from "react";
import {
  Sparkles,
  Download,
  GraduationCap,
  Layers,
  BookOpen,
  ClipboardCheck,
  Wrench,
  Smile,
  Loader2,
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
import { PlanBlock } from "./plan-block";
import { BNCCBadge } from "./bncc-badge";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { ExportPDFButton, ActivityPDFButton } from "./export-pdf-button";

interface DevelopmentBlock {
  etapa: string;
  tempo: string;
  atividade: string;
  tipo: string;
  observacao?: string;
}

interface BNCCSkill {
  codigo: string;
  descricao: string;
}

interface Adaptation {
  para: string;
  adaptacao: string;
}

interface LessonPlan {
  titulo: string;
  objetivos: string[];
  habilidades_bncc: BNCCSkill[];
  materiais_necessarios: string[];
  desenvolvimento: DevelopmentBlock[];
  avaliacao: string;
  tarefa_de_casa: string | null;
  sugestoes_de_adaptacao: Adaptation[];
}

interface PlanDisplayProps {
  plan: LessonPlan;
  tema: string;
  disciplina: string;
  ano: string;
  tempoTotal: string;
}

export function PlanDisplay({
  plan: initialPlan,
  tema,
  disciplina,
  ano,
  tempoTotal,
}: PlanDisplayProps) {
  const [plan, setPlan] = useState<LessonPlan>(initialPlan);
  const [activeTab, setActiveTab] = useState<
    "stages" | "details" | "adaptations"
  >("stages");
  const [isExporting, setIsExporting] = useState(false);

  const handleBlockUpdated = (index: number, newBlock: DevelopmentBlock) => {
    const updatedDes = [...plan.desenvolvimento];
    updatedDes[index] = newBlock;
    setPlan({
      ...plan,
      desenvolvimento: updatedDes,
    });
  };

  // Helper to remove accents/non-ASCII chars to prevent pdf-lib Helvetica crash
  const sanitizeText = (text: string) => {
    if (!text) return "";
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accent marks
      .replace(/ç/g, "c")
      .replace(/Ç/g, "C")
      .replace(/[^\x00-\x7F]/g, ""); // filter out non-ASCII
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([595.276, 841.89]); // A4 Standard
      const { width, height } = page.getSize();

      const HelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const Helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let yOffset = height - 50;

      const addText = (
        text: string,
        x: number,
        fontSize: number,
        font: any,
        colorRGB = rgb(0.1, 0.1, 0.1),
        spacing = 18
      ) => {
        const sanitized = sanitizeText(text);
        if (yOffset < 50) {
          page = pdfDoc.addPage([595.276, 841.89]);
          yOffset = height - 50;
        }
        page.drawText(sanitized, {
          x,
          y: yOffset,
          size: fontSize,
          font,
          color: colorRGB,
        });
        yOffset -= spacing;
      };

      // Header Banner (Rose and Indigo theme)
      page.drawRectangle({
        x: 0,
        y: height - 100,
        width,
        height: 100,
        color: rgb(0.388, 0.4, 0.945), // #6366f1 Primary
      });

      page.drawText(
        sanitizeText(`PLANO DE AULA: ${plan.titulo.toUpperCase()}`),
        {
          x: 40,
          y: height - 45,
          size: 15,
          font: HelveticaBold,
          color: rgb(1, 1, 1),
        }
      );

      page.drawText(
        sanitizeText(
          `Disciplina: ${disciplina}  |  Ano: ${ano}  |  Duração: ${tempoTotal}`
        ),
        {
          x: 40,
          y: height - 70,
          size: 10,
          font: Helvetica,
          color: rgb(0.9, 0.9, 1),
        }
      );

      yOffset = height - 130;

      // 1. OBJETIVOS
      addText(
        "OBJETIVOS DE APRENDIZAGEM",
        40,
        12,
        HelveticaBold,
        rgb(0.388, 0.4, 0.945),
        20
      );
      plan.objetivos.forEach((obj) => {
        const wrappedLines = obj.match(/.{1,80}(\s|$)/g) || [obj];
        wrappedLines.forEach((line, i) => {
          addText(
            i === 0 ? `- ${line.trim()}` : `  ${line.trim()}`,
            50,
            10,
            Helvetica,
            rgb(0.2, 0.2, 0.2),
            14
          );
        });
      });
      yOffset -= 10;

      // 2. HABILIDADES BNCC
      addText(
        "HABILIDADES BNCC",
        40,
        12,
        HelveticaBold,
        rgb(0.388, 0.4, 0.945),
        20
      );
      plan.habilidades_bncc.forEach((h) => {
        addText(
          `* ${h.codigo}:`,
          50,
          10,
          HelveticaBold,
          rgb(0.1, 0.1, 0.15),
          14
        );
        const wrappedDesc = h.descricao.match(/.{1,80}(\s|$)/g) || [
          h.descricao,
        ];
        wrappedDesc.forEach((line) => {
          addText(line.trim(), 60, 9, Helvetica, rgb(0.3, 0.3, 0.3), 13);
        });
      });
      yOffset -= 10;

      // 3. MATERIAIS
      addText(
        "MATERIAIS NECESSARIOS",
        40,
        12,
        HelveticaBold,
        rgb(0.388, 0.4, 0.945),
        20
      );
      plan.materiais_necessarios.forEach((mat) => {
        addText(`- ${mat}`, 50, 10, Helvetica, rgb(0.2, 0.2, 0.2), 14);
      });
      yOffset -= 15;

      // 4. DESENVOLVIMENTO
      addText(
        "DESENVOLVIMENTO DA AULA (ETAPAS)",
        40,
        12,
        HelveticaBold,
        rgb(0.388, 0.4, 0.945),
        20
      );
      plan.desenvolvimento.forEach((d) => {
        addText(
          `${d.etapa} (${d.tempo}) - Tipo: ${d.tipo}`,
          50,
          10,
          HelveticaBold,
          rgb(0.1, 0.1, 0.2),
          15
        );

        // Wrap activity text
        const wrappedAct = d.atividade.match(/.{1,80}(\s|$)/g) || [d.atividade];
        wrappedAct.forEach((line) => {
          addText(line.trim(), 60, 9.5, Helvetica, rgb(0.25, 0.25, 0.25), 13);
        });

        if (d.observacao) {
          addText(
            `Obs: ${d.observacao}`,
            60,
            9,
            Helvetica,
            rgb(0.4, 0.4, 0.6),
            13
          );
        }
        yOffset -= 8;
      });
      yOffset -= 10;

      // 5. AVALIACAO & TAREFA
      addText(
        "AVALIACAO FORMATIVA",
        40,
        12,
        HelveticaBold,
        rgb(0.388, 0.4, 0.945),
        20
      );
      const wrappedAv = plan.avaliacao.match(/.{1,80}(\s|$)/g) || [
        plan.avaliacao,
      ];
      wrappedAv.forEach((line) => {
        addText(line.trim(), 50, 10, Helvetica, rgb(0.2, 0.2, 0.2), 14);
      });
      yOffset -= 10;

      if (plan.tarefa_de_casa) {
        addText(
          "TAREFA DE CASA",
          40,
          12,
          HelveticaBold,
          rgb(0.388, 0.4, 0.945),
          20
        );
        const wrappedTar = plan.tarefa_de_casa.match(/.{1,80}(\s|$)/g) || [
          plan.tarefa_de_casa,
        ];
        wrappedTar.forEach((line) => {
          addText(line.trim(), 50, 10, Helvetica, rgb(0.2, 0.2, 0.2), 14);
        });
        yOffset -= 10;
      }

      // 6. ADAPTACOES
      addText(
        "SUGESTOES DE ADAPTACAO",
        40,
        12,
        HelveticaBold,
        rgb(0.388, 0.4, 0.945),
        20
      );
      plan.sugestoes_de_adaptacao.forEach((ad) => {
        addText(
          `Para ${ad.para}:`,
          50,
          10,
          HelveticaBold,
          rgb(0.1, 0.1, 0.15),
          14
        );
        const wrappedAd = ad.adaptacao.match(/.{1,80}(\s|$)/g) || [
          ad.adaptacao,
        ];
        wrappedAd.forEach((line) => {
          addText(line.trim(), 60, 9.5, Helvetica, rgb(0.3, 0.3, 0.3), 13);
        });
      });

      // Save PDF bytes
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Plano_de_Aula_${sanitizeText(plan.titulo).replace(/\s+/g, "_")}.pdf`;
      link.click();
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert(
        "Houve uma falha ao renderizar seu PDF. Tente copiar o conteúdo manualmente."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500">
      {/* Visual Header Card */}
      <Card className="border-border bg-card shadow-lg relative overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
        <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary hover:bg-primary/95 text-white font-bold px-2.5 py-0.5 rounded-lg text-[10px] sm:text-xs">
                {disciplina}
              </Badge>
              <Badge className="bg-secondary hover:bg-secondary/95 text-white font-bold px-2.5 py-0.5 rounded-lg text-[10px] sm:text-xs">
                {ano}
              </Badge>
              <Badge className="bg-muted text-muted-foreground border-border font-bold px-2.5 py-0.5 rounded-lg text-[10px] sm:text-xs">
                {tempoTotal}
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight leading-snug">
              {plan.titulo}
            </h2>
            <p className="text-xs text-muted-foreground font-semibold">
              Tema pedagógico gerado sobre:{" "}
              <span className="text-primary">&quot;{tema}&quot;</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <ExportPDFButton
              plan={plan}
              disciplina={disciplina}
              ano={ano}
              tempoTotal={tempoTotal}
            />
            <ActivityPDFButton tema={tema} disciplina={disciplina} ano={ano} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs Selector Navigation */}
      <div className="flex border-b border-border bg-muted/10 rounded-xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("stages")}
          className={`flex-1 py-3 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 rounded-xl transition-all ${
            activeTab === "stages"
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Etapas de Aula</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`flex-1 py-3 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 rounded-xl transition-all ${
            activeTab === "details"
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Diretrizes & Materiais</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("adaptations")}
          className={`flex-1 py-3 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 rounded-xl transition-all ${
            activeTab === "adaptations"
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
          }`}
        >
          <Smile className="h-4 w-4" />
          <span>Adaptações & Inclusão</span>
        </button>
      </div>

      {/* Dynamic Tab Body rendering */}
      <div className="space-y-6">
        {/* TAB 1: STAGES */}
        {activeTab === "stages" && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2 pl-1">
              <Layers className="h-5 w-5 text-primary" />
              <span>Etapas de Desenvolvimento Pedagógico</span>
            </h3>
            <div className="grid gap-4">
              {plan.desenvolvimento.map((blockData, idx) => (
                <PlanBlock
                  key={idx}
                  block={blockData}
                  tema={tema}
                  disciplina={disciplina}
                  ano={ano}
                  tempoTotal={tempoTotal}
                  onBlockUpdated={(newBlock) =>
                    handleBlockUpdated(idx, newBlock)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: GUIDELINES & MATERIALS */}
        {activeTab === "details" && (
          <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-300">
            {/* Objectives and BNCC skills */}
            <div className="space-y-5">
              <Card className="border-border bg-card rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <span>Objetivos de Aprendizagem</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.objetivos.map((obj, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
                      <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-semibold">
                        {obj}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border bg-card rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span>Habilidades BNCC Identificadas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.habilidades_bncc.map((skill, i) => (
                    <div
                      key={i}
                      className="space-y-1.5 border-b border-border/40 pb-3 last:border-b-0 last:pb-0"
                    >
                      <BNCCBadge code={skill.codigo} />
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium pl-1">
                        {skill.descricao}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Materials, Assessment, and Homework */}
            <div className="space-y-5">
              <Card className="border-border bg-card rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    <span>Materiais e Recursos Necessários</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {plan.materiais_necessarios.map((mat, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="border-border bg-background hover:bg-muted/10 font-bold px-3 py-1 rounded-xl text-xs"
                    >
                      {mat}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border bg-card rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    <span>Plano de Avaliação Formativa</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-medium">
                    {plan.avaliacao}
                  </p>
                </CardContent>
              </Card>

              {plan.tarefa_de_casa && (
                <Card className="border-border bg-card rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      <span>Tarefa de Casa Recomendada</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-medium">
                      {plan.tarefa_de_casa}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ADAPTATIONS */}
        {activeTab === "adaptations" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2 pl-1">
              <Smile className="h-5 w-5 text-primary" />
              <span>Inclusão e Sugestões de Diferenciação</span>
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              {plan.sugestoes_de_adaptacao.map((ad, i) => (
                <Card
                  key={i}
                  className="border border-border/80 hover:border-primary/20 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all p-5 space-y-2.5"
                >
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 font-bold rounded-lg text-[10px] sm:text-xs uppercase tracking-wide">
                    Para: {ad.para}
                  </Badge>
                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-semibold">
                    {ad.adaptacao}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
