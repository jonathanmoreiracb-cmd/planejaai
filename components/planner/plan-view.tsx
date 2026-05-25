"use client";

import { useState } from "react";
import {
  Sparkles,
  Calendar,
  Clock,
  Download,
  CheckCircle2,
  ChevronRight,
  ListTodo,
  BookOpen,
  Lightbulb,
  Undo2,
  Accessibility,
  Brain,
  Puzzle,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface DayPlan {
  day: number;
  topic: string;
  duration: string;
  tasks: string[];
}

interface WeekPlan {
  weekNumber: number;
  theme: string;
  days: DayPlan[];
}

interface Plan {
  title: string;
  description: string;
  weeks: WeekPlan[];
  tips: string[];
}

interface PlanViewProps {
  plan: Plan;
}

export function PlanView({ plan }: PlanViewProps) {
  const [currentPlan, setCurrentPlan] = useState<Plan>(plan);
  const [originalPlan] = useState<Plan>(plan);
  const [isAdapting, setIsAdapting] = useState(false);
  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(
    {}
  );

  // Calculate overall plan progress
  const totalTasks = currentPlan.weeks.reduce(
    (acc, week) =>
      acc + week.days.reduce((dAcc, day) => dAcc + day.tasks.length, 0),
    0
  );

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const toggleTask = (
    weekNumber: number,
    dayNumber: number,
    taskIndex: number
  ) => {
    const key = `${weekNumber}-${dayNumber}-${taskIndex}`;
    setCompletedTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAdaptPlan = async (
    profile: "tea" | "tdah" | "dislexia" | "avancado"
  ) => {
    setIsAdapting(true);
    setActiveProfile(profile);
    try {
      const res = await fetch("/api/adapt-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: originalPlan, profile }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao adaptar plano de aula.");
      }
      setCurrentPlan(data.plan);
    } catch (err: any) {
      console.error(err);
      alert(
        err.message ||
          "Houve um erro ao adaptar seu plano para inclusão. Tente novamente."
      );
      setActiveProfile(null);
    } finally {
      setIsAdapting(false);
    }
  };

  const handleRestoreOriginal = () => {
    setCurrentPlan(originalPlan);
    setActiveProfile(null);
  };

  const sanitize = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/\u2026/g, "...")
      .replace(/[^\u0000-\u00FF]/g, "");
  };

  const handleDownloadPDF = async () => {
    try {
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
        spacing = 20
      ) => {
        const sanitized = sanitize(text);
        if (yOffset < 60) {
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

      // Header Banner
      page.drawRectangle({
        x: 0,
        y: height - 80,
        width,
        height: 80,
        color: rgb(0.388, 0.4, 0.945), // #6366f1
      });

      page.drawText(sanitize("PlanejaAI - Acessibilidade & Inclusão"), {
        x: 40,
        y: height - 48,
        size: 20,
        font: HelveticaBold,
        color: rgb(1, 1, 1),
      });

      yOffset = height - 110;

      addText(
        currentPlan.title,
        40,
        16,
        HelveticaBold,
        rgb(0.1, 0.1, 0.15),
        25
      );

      const descLines = currentPlan.description.match(/.{1,70}(\s|$)/g) || [
        currentPlan.description,
      ];
      descLines.forEach((line) => {
        addText(line.trim(), 40, 10, Helvetica, rgb(0.3, 0.3, 0.3), 15);
      });
      yOffset -= 10;

      currentPlan.weeks.forEach((week) => {
        addText(
          `Semana ${week.weekNumber}: ${week.theme}`,
          40,
          13,
          HelveticaBold,
          rgb(0.957, 0.247, 0.369),
          20
        );

        week.days.forEach((day) => {
          addText(
            `Dia ${day.day}: ${day.topic} (${day.duration})`,
            50,
            10.5,
            HelveticaBold,
            rgb(0.15, 0.15, 0.2),
            16
          );

          day.tasks.forEach((task) => {
            const taskText = `- ${task}`;
            const taskLines = taskText.match(/.{1,65}(\s|$)/g) || [taskText];
            taskLines.forEach((line, index) => {
              addText(
                index === 0 ? line.trim() : `    ${line.trim()}`,
                65,
                9,
                Helvetica,
                rgb(0.4, 0.4, 0.4),
                13
              );
            });
          });
          yOffset -= 5;
        });
        yOffset -= 10;
      });

      if (currentPlan.tips && currentPlan.tips.length > 0) {
        addText(
          "Dicas de Aplicação Pedagógica Inclusiva:",
          40,
          11.5,
          HelveticaBold,
          rgb(0.388, 0.4, 0.945),
          18
        );
        currentPlan.tips.forEach((tip) => {
          const tipText = `• ${tip}`;
          const tipLines = tipText.match(/.{1,70}(\s|$)/g) || [tipText];
          tipLines.forEach((line) => {
            addText(line.trim(), 50, 9, Helvetica, rgb(0.3, 0.3, 0.3), 14);
          });
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${currentPlan.title.replace(/\s+/g, "_")}.pdf`;
      link.click();
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Houve um erro ao exportar seu PDF. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Plan Header Card */}
      <Card className="overflow-hidden border-border bg-card shadow-lg relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary" />
        <CardHeader className="pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary hover:bg-primary text-white border-none font-semibold">
                  Inteligência Artificial
                </Badge>
                {activeProfile && (
                  <Badge className="bg-indigo-600 text-white border-none font-semibold">
                    Adaptado: {activeProfile.toUpperCase()}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="text-secondary border-secondary/30"
                >
                  {currentPlan.weeks.length} Semanas
                </Badge>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {currentPlan.title}
              </CardTitle>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {activeProfile && (
                <Button
                  onClick={handleRestoreOriginal}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/5 font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Undo2 className="h-4 w-4" />
                  Restaurar Original
                </Button>
              )}
              <Button
                onClick={handleDownloadPDF}
                className="bg-secondary hover:bg-secondary/90 text-white font-semibold flex items-center gap-2 transition-all"
              >
                <Download className="h-4 w-4" />
                Baixar em PDF
              </Button>
            </div>
          </div>
          <CardDescription className="text-sm sm:text-base text-muted-foreground pt-2">
            {currentPlan.description}
          </CardDescription>
        </CardHeader>

        {/* Progress Section */}
        <CardContent className="border-t border-border/50 bg-muted/20 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ListTodo className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Progresso do Plano
              </p>
              <p className="text-xs text-muted-foreground">
                {completedCount} de {totalTasks} tarefas concluídas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="w-full bg-border h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm font-bold text-primary min-w-[36px] text-right">
              {progressPercentage}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Magical 1-Click Inclusion & Adaptation Panel */}
      <Card className="border-border/60 bg-gradient-to-br from-indigo-50/50 via-white to-pink-50/50 dark:from-slate-900 dark:to-slate-900 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
              <Accessibility className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">
                Assistente de Inclusão e Acessibilidade (AEE)
              </CardTitle>
              <CardDescription className="text-xs">
                Adapte as atividades metodológicas deste plano de ação com 1
                clique para apoiar alunos com diferentes perfis cognitivos.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleAdaptPlan("tea")}
              disabled={isAdapting}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between h-24 transition-all duration-300 relative overflow-hidden ${
                activeProfile === "tea"
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                  : "bg-background border-border/80 hover:border-indigo-400 hover:bg-indigo-50/30 text-foreground"
              }`}
            >
              <Puzzle className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Autismo (TEA)</p>
                <p
                  className={`text-[9px] mt-0.5 leading-tight ${activeProfile === "tea" ? "text-indigo-100" : "text-muted-foreground"}`}
                >
                  Rotina previsível e pequenos passos visuais.
                </p>
              </div>
            </button>

            <button
              onClick={() => handleAdaptPlan("tdah")}
              disabled={isAdapting}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between h-24 transition-all duration-300 relative overflow-hidden ${
                activeProfile === "tdah"
                  ? "bg-rose-500 border-rose-500 text-white shadow-md"
                  : "bg-background border-border/80 hover:border-rose-400 hover:bg-rose-50/30 text-foreground"
              }`}
            >
              <Brain className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Foco / TDAH</p>
                <p
                  className={`text-[9px] mt-0.5 leading-tight ${activeProfile === "tdah" ? "text-rose-100" : "text-muted-foreground"}`}
                >
                  Quebras dinâmicas e tarefas práticas de ação.
                </p>
              </div>
            </button>

            <button
              onClick={() => handleAdaptPlan("dislexia")}
              disabled={isAdapting}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between h-24 transition-all duration-300 relative overflow-hidden ${
                activeProfile === "dislexia"
                  ? "bg-amber-500 border-amber-500 text-white shadow-md"
                  : "bg-background border-border/80 hover:border-amber-400 hover:bg-amber-50/30 text-foreground"
              }`}
            >
              <BookOpen className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Dislexia / Leitura</p>
                <p
                  className={`text-[9px] mt-0.5 leading-tight ${activeProfile === "dislexia" ? "text-amber-100" : "text-muted-foreground"}`}
                >
                  Redução de escrita densa e foco em áudio/visual.
                </p>
              </div>
            </button>

            <button
              onClick={() => handleAdaptPlan("avancado")}
              disabled={isAdapting}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between h-24 transition-all duration-300 relative overflow-hidden ${
                activeProfile === "avancado"
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                  : "bg-background border-border/80 hover:border-emerald-400 hover:bg-emerald-50/30 text-foreground"
              }`}
            >
              <Sparkles className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Superdotação</p>
                <p
                  className={`text-[9px] mt-0.5 leading-tight ${activeProfile === "avancado" ? "text-emerald-100" : "text-muted-foreground"}`}
                >
                  Desafios cognitivos e investigações extras.
                </p>
              </div>
            </button>
          </div>

          {isAdapting && (
            <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-indigo-50/40 dark:bg-slate-800 rounded-xl border border-indigo-100/50 animate-pulse">
              <Loader2 className="h-4.5 w-4.5 animate-spin text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                A IA está adaptando este plano pedagógico para o perfil{" "}
                {activeProfile?.toUpperCase()}...
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Week Selector / Navigation Tabs */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Week sidebar selector */}
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 shrink-0 md:w-56 border-b md:border-b-0 md:border-r border-border md:pr-4">
          {currentPlan.weeks.map((week) => (
            <button
              key={week.weekNumber}
              onClick={() => setActiveWeek(week.weekNumber)}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap md:whitespace-normal ${
                activeWeek === week.weekNumber
                  ? "bg-primary text-white shadow-md shadow-primary/15 font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Semana {week.weekNumber}</span>
              </div>
              <ChevronRight
                className={`h-4 w-4 hidden md:block transition-transform ${activeWeek === week.weekNumber ? "translate-x-1" : "opacity-30"}`}
              />
            </button>
          ))}
        </div>

        {/* Active Week Details */}
        <div className="flex-1 space-y-6">
          {currentPlan.weeks.map((week) => {
            if (week.weekNumber !== activeWeek) return null;
            return (
              <div
                key={week.weekNumber}
                className="space-y-4 animate-in fade-in duration-300"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Tema da Semana
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {week.theme}
                    </p>
                  </div>
                </div>

                {/* Days inside current week */}
                <div className="grid gap-4">
                  {week.days.map((day) => (
                    <Card
                      key={day.day}
                      className="border-border/80 hover:border-primary/30 transition-colors shadow-sm overflow-hidden"
                    >
                      <div className="flex items-center justify-between bg-muted/30 px-4 py-3 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white text-xs font-bold">
                            D{day.day}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-foreground">
                            {day.topic}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{day.duration}</span>
                        </div>
                      </div>

                      <CardContent className="p-4 bg-card">
                        <ul className="space-y-3">
                          {day.tasks.map((task, taskIdx) => {
                            const taskKey = `${week.weekNumber}-${day.day}-${taskIdx}`;
                            const isDone = !!completedTasks[taskKey];
                            return (
                              <li
                                key={taskIdx}
                                onClick={() =>
                                  toggleTask(week.weekNumber, day.day, taskIdx)
                                }
                                className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                                  isDone
                                    ? "bg-primary/5 border-primary/20 text-muted-foreground line-through"
                                    : "bg-background border-border/60 hover:bg-muted/40 hover:border-primary/20 text-foreground"
                                }`}
                              >
                                <button
                                  className={`flex shrink-0 h-5 w-5 items-center justify-center rounded border transition-all mt-0.5 ${
                                    isDone
                                      ? "bg-primary border-primary text-white"
                                      : "border-muted-foreground/35 bg-white"
                                  }`}
                                >
                                  {isDone && (
                                    <CheckCircle2 className="h-4.5 w-4.5 text-white" />
                                  )}
                                </button>
                                <span className="text-sm font-medium leading-tight">
                                  {task}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Practical Tips */}
          {currentPlan.tips && currentPlan.tips.length > 0 && (
            <Alert className="border-primary/20 bg-primary/5 text-foreground rounded-2xl p-5">
              <Lightbulb className="h-5 w-5 text-primary" />
              <AlertTitle className="text-base font-bold text-primary flex items-center gap-1.5">
                Dicas de Aplicação Pedagógica
              </AlertTitle>
              <AlertDescription className="mt-2">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {currentPlan.tips.map((tip, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
