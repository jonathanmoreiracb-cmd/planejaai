import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  BookOpen,
  Download,
  LayoutDashboard,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const features = [
    {
      icon: BrainCircuit,
      title: "Inteligência Artificial Gemini",
      description:
        "Modelos da Google estruturam seus planos de forma cirúrgica e inteligente baseados no seu perfil.",
    },
    {
      icon: Target,
      title: "Divisão Diária Realista",
      description:
        "Chega de planos impossíveis. Cada dia tem o tempo ideal de dedicação estipulado por você.",
    },
    {
      icon: Zap,
      title: "Checklist Dinâmico",
      description:
        "Acompanhe seu progresso em tempo real marcando as tarefas práticas concluídas e veja a barra subir.",
    },
    {
      icon: Download,
      title: "Exportação em PDF Completa",
      description:
        "Gere e baixe seu cronograma de estudos ou negócios formatado em PDF profissional com apenas um clique.",
    },
  ];

  return (
    <div className="flex-grow flex flex-col justify-center items-center relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/20 via-background to-background">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="container max-w-5xl mx-auto px-4 py-20 text-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex justify-center">
          <Badge className="bg-primary/10 hover:bg-primary/15 text-primary border-none py-1 px-3 rounded-full font-bold text-xs flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Planejamento Inteligente do Futuro</span>
          </Badge>
        </div>

        <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] max-w-4xl mx-auto">
          Crie planos de ação com{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-black relative">
            Inteligência Artificial
          </span>
        </h1>

        <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Gere roteiros de estudos, cronogramas de transição de carreira e
          planos de negócios cirúrgicos em segundos. Customize sua dedicação
          diária e exporte para PDF.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
          <Link href="/planner">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/95 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 group transition-all"
            >
              <span>Criar Meu Plano Grátis</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="border-border hover:border-primary/20 bg-background/50 hover:bg-muted/30 font-bold h-12 px-8 rounded-xl flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Ver Dashboard</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Grid Features Section */}
      <section className="container max-w-5xl mx-auto px-4 py-12 border-t border-border/50">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/20 transition-all space-y-3"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center shadow-lg shadow-primary/10">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-sm sm:text-base text-foreground leading-snug">
                  {feat.title}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer Portal */}
      <section className="w-full bg-muted/20 border-t border-border/50 py-8 mt-12 text-center text-xs text-muted-foreground">
        <div className="container max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © 2026 PlanejaAI. Todos os direitos reservados. Feito com Next.js &
            Gemini.
          </p>
          <div className="flex gap-4">
            <Link
              href="/pricing"
              className="hover:text-primary transition-colors font-medium"
            >
              Preços
            </Link>
            <Link
              href="/setup"
              className="hover:text-primary transition-colors font-medium"
            >
              Configurar Perfil
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
