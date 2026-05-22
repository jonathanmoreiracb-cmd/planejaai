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
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(
    {}
  );

  // Calculate overall plan progress
  const totalTasks = plan.weeks.reduce(
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

  const handleDownloadPDF = async () => {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([595.276, 841.89]); // A4 Size
      const { width, height } = page.getSize();

      const HelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const Helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let yOffset = height - 50;

      // Helper to add text and manage page breaks
      const addText = (
        text: string,
        x: number,
        fontSize: number,
        font: any,
        colorRGB = rgb(0.1, 0.1, 0.1),
        spacing = 20
      ) => {
        if (yOffset < 60) {
          page = pdfDoc.addPage([595.276, 841.89]);
          yOffset = height - 50;
        }
        page.drawText(text, {
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

      page.drawText("PlanejaAI - Plano de Ação", {
        x: 40,
        y: height - 48,
        size: 24,
        font: HelveticaBold,
        color: rgb(1, 1, 1),
      });

      yOffset = height - 110;

      // Title & Intro
      addText(plan.title, 40, 18, HelveticaBold, rgb(0.1, 0.1, 0.15), 25);

      // Wrap description text roughly
      const descLines = plan.description.match(/.{1,70}(\s|$)/g) || [
        plan.description,
      ];
      descLines.forEach((line) => {
        addText(line.trim(), 40, 10, Helvetica, rgb(0.3, 0.3, 0.3), 15);
      });
      yOffset -= 10;

      // Iterate weeks
      plan.weeks.forEach((week) => {
        addText(
          `Semana ${week.weekNumber}: ${week.theme}`,
          40,
          14,
          HelveticaBold,
          rgb(0.957, 0.247, 0.369),
          20
        ); // #f43f5e

        week.days.forEach((day) => {
          addText(
            `Dia ${day.day}: ${day.topic} (${day.duration})`,
            50,
            11,
            HelveticaBold,
            rgb(0.15, 0.15, 0.2),
            16
          );

          day.tasks.forEach((task) => {
            const taskText = `- [ ] ${task}`;
            const taskLines = taskText.match(/.{1,65}(\s|$)/g) || [taskText];
            taskLines.forEach((line, index) => {
              addText(
                index === 0 ? line.trim() : `     ${line.trim()}`,
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

      // Tips Section
      if (plan.tips && plan.tips.length > 0) {
        addText(
          "Dicas Práticas para o Sucesso:",
          40,
          12,
          HelveticaBold,
          rgb(0.388, 0.4, 0.945),
          18
        );
        plan.tips.forEach((tip) => {
          const tipText = `• ${tip}`;
          const tipLines = tipText.match(/.{1,70}(\s|$)/g) || [tipText];
          tipLines.forEach((line) => {
            addText(line.trim(), 50, 9.5, Helvetica, rgb(0.3, 0.3, 0.3), 14);
          });
        });
      }

      // Save and trigger download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${plan.title.replace(/\s+/g, "_")}.pdf`;
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
                <Badge
                  variant="outline"
                  className="text-secondary border-secondary/30"
                >
                  {plan.weeks.length} Semanas
                </Badge>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {plan.title}
              </CardTitle>
            </div>

            <Button
              onClick={handleDownloadPDF}
              className="bg-secondary hover:bg-secondary/90 text-white font-semibold flex items-center gap-2 self-start sm:self-auto transition-all"
            >
              <Download className="h-4 w-4" />
              Baixar em PDF
            </Button>
          </div>
          <CardDescription className="text-sm sm:text-base text-muted-foreground pt-2">
            {plan.description}
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

      {/* Week Selector / Navigation Tabs */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Week sidebar selector */}
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 shrink-0 md:w-56 border-b md:border-b-0 md:border-r border-border md:pr-4">
          {plan.weeks.map((week) => (
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
          {plan.weeks.map((week) => {
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
          {plan.tips && plan.tips.length > 0 && (
            <Alert className="border-primary/20 bg-primary/5 text-foreground rounded-2xl p-5">
              <Lightbulb className="h-5 w-5 text-primary" />
              <AlertTitle className="text-base font-bold text-primary flex items-center gap-1.5">
                Dicas de Produtividade
              </AlertTitle>
              <AlertDescription className="mt-2">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.tips.map((tip, idx) => (
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
