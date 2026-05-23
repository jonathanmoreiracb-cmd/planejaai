"use client";

import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Download, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

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

interface ExportPDFButtonProps {
  plan: LessonPlan;
  disciplina: string;
  ano: string;
  tempoTotal: string;
}

// Utility to remove accents and non-ASCII chars safely
const sanitize = (text: string): string => {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/[^\x00-\x7F]/g, "");
};

// Word wrapping utility for canvas drawing
const wrapText = (text: string, maxChars: number): string[] => {
  if (!text) return [];
  const paragraphs = text.split("\n");
  const allLines: string[] = [];

  paragraphs.forEach((para) => {
    if (para.trim() === "") {
      allLines.push("");
      return;
    }

    const words = para.split(" ");
    let currentLine = "";

    words.forEach((word) => {
      if ((currentLine + " " + word).trim().length > maxChars) {
        allLines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine = (currentLine + " " + word).trim();
      }
    });

    if (currentLine) {
      allLines.push(currentLine.trim());
    }
  });

  return allLines;
};

export function ExportPDFButton({
  plan,
  disciplina,
  ano,
  tempoTotal,
}: ExportPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { planTier } = useSubscription();

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const HelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const Helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const drawPageWatermark = (p: any) => {
        if (planTier === "free" || !planTier) {
          p.drawText(sanitize("PLANEJAAI - PLANO GRATUITO"), {
            x: 100,
            y: 350,
            size: 26,
            font: HelveticaBold,
            color: rgb(0.85, 0.85, 0.85),
            opacity: 0.15,
            rotate: degrees(40),
          });
        }
      };

      let page = pdfDoc.addPage([595.276, 841.89]); // A4 Size
      drawPageWatermark(page);
      const { width, height } = page.getSize();

      let yOffset = height - 50;

      const addText = (
        text: string,
        x: number,
        fontSize: number,
        font: any,
        colorRGB = rgb(0.1, 0.1, 0.1),
        spacing = 16
      ) => {
        const sanitized = sanitize(text);
        if (yOffset < 60) {
          // Draw footer before adding page
          page.drawText(sanitize("Gerado por PlanejaAI"), {
            x: 40,
            y: 30,
            size: 8,
            font: Helvetica,
            color: rgb(0.5, 0.5, 0.5),
          });
          page = pdfDoc.addPage([595.276, 841.89]);
          drawPageWatermark(page);
          yOffset = height - 50;
        }
        if (sanitized !== "") {
          page.drawText(sanitized, {
            x,
            y: yOffset,
            size: fontSize,
            font,
            color: colorRGB,
          });
        }
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

      const wrappedTitle = wrapText(
        `PLANO DE AULA: ${plan.titulo.toUpperCase()}`,
        52
      );
      wrappedTitle.forEach((line, index) => {
        page.drawText(sanitize(line), {
          x: 40,
          y: height - 32 - index * 16,
          size: 11.5,
          font: HelveticaBold,
          color: rgb(1, 1, 1),
        });
      });

      page.drawText(
        sanitize(
          `Disciplina: ${disciplina}  |  Ano Escolar: ${ano}  |  Duração: ${tempoTotal}`
        ),
        {
          x: 40,
          y: height - 42 - wrappedTitle.length * 16,
          size: 9.5,
          font: Helvetica,
          color: rgb(0.9, 0.9, 1),
        }
      );

      yOffset = height - 130;

      // School/Teacher mock header fields
      addText(
        "Nome da Escola: __________________________________________________",
        40,
        10,
        HelveticaBold,
        rgb(0.3, 0.3, 0.3),
        18
      );
      addText(
        "Professora: ___________________________   Data: ____/____/_______",
        40,
        10,
        HelveticaBold,
        rgb(0.3, 0.3, 0.3),
        25
      );

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
        const wrappedLines = wrapText(obj, 75);
        wrappedLines.forEach((line, i) => {
          addText(
            i === 0 ? `- ${line}` : `  ${line}`,
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
        const wrappedDesc = wrapText(h.descricao, 75);
        wrappedDesc.forEach((line) => {
          addText(line, 60, 9, Helvetica, rgb(0.3, 0.3, 0.3), 13);
        });
      });
      yOffset -= 10;

      // 3. DESENVOLVIMENTO
      addText(
        "DESENVOLVIMENTO DA AULA (ETAPAS)",
        40,
        12,
        HelveticaBold,
        rgb(0.388, 0.4, 0.945),
        20
      );
      (plan.desenvolvimento || []).forEach((d) => {
        if (!d) return;

        // 1. Draw Stage and duration title
        addText(
          `${d.etapa || "Desenvolvimento"} (${d.tempo || "15 minutos"})`,
          50,
          10,
          HelveticaBold,
          rgb(0.1, 0.1, 0.2),
          14
        );

        // 2. Draw Methodology (wrapped to make sure it never overflows)
        const tipoText = `Metodologia: ${d.tipo || ""}`;
        const wrappedTipo = wrapText(tipoText, 75);
        wrappedTipo.forEach((line) => {
          addText(line, 60, 9, Helvetica, rgb(0.4, 0.4, 0.4), 13);
        });

        // 3. Draw Detailed Activity (wrapped)
        const wrappedAct = wrapText(d.atividade || "", 75);
        wrappedAct.forEach((line) => {
          addText(line, 60, 9.5, Helvetica, rgb(0.25, 0.25, 0.25), 13);
        });

        // 4. Draw Mediation Tip (wrapped to make sure it never overflows)
        if (d.observacao) {
          const wrappedObs = wrapText(`Dica: ${d.observacao}`, 75);
          wrappedObs.forEach((line) => {
            addText(line, 60, 9, Helvetica, rgb(0.4, 0.4, 0.6), 13);
          });
        }
        yOffset -= 8;
      });
      yOffset -= 10;

      // 4. AVALIACAO & TAREFA
      addText(
        "AVALIACAO FORMATIVA",
        40,
        12,
        HelveticaBold,
        rgb(0.388, 0.4, 0.945),
        20
      );
      const wrappedAv = wrapText(plan.avaliacao, 75);
      wrappedAv.forEach((line) => {
        addText(line, 50, 10, Helvetica, rgb(0.2, 0.2, 0.2), 14);
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
        const wrappedTar = wrapText(plan.tarefa_de_casa, 75);
        wrappedTar.forEach((line) => {
          addText(line, 50, 10, Helvetica, rgb(0.2, 0.2, 0.2), 14);
        });
      }

      if (
        plan.sugestoes_de_adaptacao &&
        plan.sugestoes_de_adaptacao.length > 0
      ) {
        yOffset -= 10;
        addText(
          "SUGESTOES DE ADAPTACAO (INCLUSAO)",
          40,
          12,
          HelveticaBold,
          rgb(0.388, 0.4, 0.945),
          20
        );
        plan.sugestoes_de_adaptacao.forEach((adapt) => {
          addText(
            `Para ${adapt.para}:`,
            50,
            10,
            HelveticaBold,
            rgb(0.1, 0.1, 0.15),
            14
          );
          const wrappedAdapt = wrapText(adapt.adaptacao, 75);
          wrappedAdapt.forEach((line) => {
            addText(line, 60, 9.5, Helvetica, rgb(0.25, 0.25, 0.25), 13);
          });
          yOffset -= 5;
        });
      }

      // Draw footer on last page
      page.drawText(sanitize("Gerado por PlanejaAI"), {
        x: 40,
        y: 30,
        size: 8,
        font: Helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Plano_de_Aula_${sanitize(plan.titulo).replace(/\s+/g, "_")}.pdf`;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Houve uma falha ao renderizar o PDF. Copie o plano manualmente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isGenerating}
      className="bg-primary hover:bg-primary/95 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/10 flex items-center justify-center gap-2 transition-all"
    >
      {isGenerating ? (
        <Loader2 className="h-4.5 w-4.5 animate-spin" />
      ) : (
        <Download className="h-4.5 w-4.5" />
      )}
      <span>Exportar Plano (PDF)</span>
    </Button>
  );
}

interface ActivityPDFButtonProps {
  tema: string;
  disciplina: string;
  ano: string;
}

export function ActivityPDFButton({
  tema,
  disciplina,
  ano,
}: ActivityPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { planTier } = useSubscription();

  const handleExportActivity = async () => {
    setIsGenerating(true);
    try {
      if (planTier !== "pro" && planTier !== "escola") {
        alert(
          "A geracao de folhas de atividades praticas em PDF e exclusiva para assinantes do Plano Pro. Faca upgrade na aba Faturamento ou Precos!"
        );
        setIsGenerating(false);
        return;
      }
      // Call standard Gemini activity generator route
      const res = await fetch("/api/generate-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, disciplina, ano }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(
          data.error ||
            "Erro ao gerar atividade prática com a inteligência artificial."
        );
      }

      const activity = data.activity;

      // Draw custom activity sheet in printable format
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([595.276, 841.89]); // A4 Size
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
        const sanitized = sanitize(text);
        if (yOffset < 60) {
          page.drawText(
            sanitize("Gerado por PlanejaAI  |  Folha de Exercícios"),
            {
              x: 40,
              y: 30,
              size: 8,
              font: Helvetica,
              color: rgb(0.5, 0.5, 0.5),
            }
          );
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

      // 1. PRINTABLE SCHOOL/STUDENT HEADER BORDER
      page.drawRectangle({
        x: 35,
        y: height - 135,
        width: width - 70,
        height: 100,
        borderWidth: 1.5,
        borderColor: rgb(0.4, 0.4, 0.5),
        color: rgb(0.98, 0.98, 0.99),
      });

      page.drawText(
        sanitize(
          "ESCOLA: __________________________________________________________________"
        ),
        {
          x: 45,
          y: height - 60,
          size: 9,
          font: HelveticaBold,
          color: rgb(0.2, 0.2, 0.2),
        }
      );

      page.drawText(
        sanitize(
          "ALUNO(A): ________________________________________________________________"
        ),
        {
          x: 45,
          y: height - 85,
          size: 9,
          font: HelveticaBold,
          color: rgb(0.2, 0.2, 0.2),
        }
      );

      page.drawText(sanitize("PROFESSOR(A): _________________________"), {
        x: 45,
        y: height - 110,
        size: 9,
        font: HelveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });

      page.drawText(sanitize("DATA: ____/____/_______"), {
        x: 280,
        y: height - 110,
        size: 9,
        font: HelveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });

      page.drawText(sanitize(`TURMA: ${ano}`), {
        x: 430,
        y: height - 110,
        size: 9,
        font: HelveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });

      yOffset = height - 165;

      // 2. WORKSHEET TITLE
      page.drawText(sanitize(activity.titulo.toUpperCase()), {
        x: 40,
        y: yOffset,
        size: 13,
        font: HelveticaBold,
        color: rgb(0.957, 0.247, 0.368), // Rose Accent
      });
      yOffset -= 25;

      // Instructions block
      addText(
        `Instrucoes: ${activity.instrucoes}`,
        40,
        9.5,
        Helvetica,
        rgb(0.3, 0.3, 0.3),
        20
      );
      yOffset -= 5;

      // 3. DRAW QUESTIONS WITH BLANK ROWS & CHECKBOXES
      activity.questoes.forEach((q: any) => {
        // Enunciado
        addText(
          `Questao ${q.numero}:`,
          40,
          10.5,
          HelveticaBold,
          rgb(0.1, 0.1, 0.15),
          13
        );
        const wrappedLines = wrapText(q.enunciado, 78);
        wrappedLines.forEach((line) => {
          addText(line, 40, 10, Helvetica, rgb(0.2, 0.2, 0.2), 13);
        });
        yOffset -= 5;

        // Custom inputs drawing based on question type
        if (q.tipo === "dissertativa") {
          const rows = q.linhas_para_resposta || 4;
          for (let r = 0; r < rows; r++) {
            if (yOffset < 60) {
              // Add page if lines exceed height limit
              addText("", 40, 10, Helvetica, rgb(0.1, 0.1, 0.1), 1);
            }
            // Draw actual dotted/dashed answer lines
            page.drawLine({
              start: { x: 50, y: yOffset - 5 },
              end: { x: width - 50, y: yOffset - 5 },
              thickness: 0.5,
              color: rgb(0.7, 0.7, 0.7),
            });
            yOffset -= 15;
          }
          yOffset -= 10;
        } else if (q.tipo === "multipla_escolha" && q.opcoes) {
          q.opcoes.forEach((option: string) => {
            if (yOffset < 60) {
              addText("", 40, 10, Helvetica, rgb(0.1, 0.1, 0.1), 1);
            }
            // Draw neat custom checkbox [ ] for children to mark
            page.drawRectangle({
              x: 52,
              y: yOffset - 4,
              width: 9,
              height: 9,
              borderWidth: 0.8,
              borderColor: rgb(0.4, 0.4, 0.5),
            });
            addText(option, 68, 9.5, Helvetica, rgb(0.2, 0.2, 0.2), 14);
          });
          yOffset -= 10;
        }
      });

      // Footer
      page.drawText(sanitize("Gerado por PlanejaAI  |  Folha de Exercicios"), {
        x: 40,
        y: 30,
        size: 8,
        font: Helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Atividade_Pratica_${sanitize(tema).replace(/\s+/g, "_")}.pdf`;
      link.click();
    } catch (err: any) {
      console.error(err);
      alert(
        err.message || "Erro inesperado ao gerar folha de atividade prática."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleExportActivity}
      disabled={isGenerating}
      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all"
    >
      {isGenerating ? (
        <Loader2 className="h-4.5 w-4.5 animate-spin" />
      ) : (
        <Sparkles className="h-4.5 w-4.5" />
      )}
      <span>Gerar Atividade (PDF)</span>
    </Button>
  );
}
