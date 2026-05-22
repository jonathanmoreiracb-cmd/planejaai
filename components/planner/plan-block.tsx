"use client";

import { useState } from "react";
import {
  Sparkles,
  Clock,
  BookOpen,
  Lightbulb,
  HelpCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Shuffle,
  Coffee,
  Gamepad2,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DevelopmentBlock {
  etapa: string;
  tempo: string;
  atividade: string;
  tipo: string;
  observacao?: string;
}

interface PlanBlockProps {
  block: DevelopmentBlock;
  tema: string;
  disciplina: string;
  ano: string;
  tempoTotal: string;
  onBlockUpdated: (newBlock: DevelopmentBlock) => void;
}

export function PlanBlock({
  block,
  tema,
  disciplina,
  ano,
  tempoTotal,
  onBlockUpdated,
}: PlanBlockProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styleOptions = [
    {
      label: "Mais Calma",
      value: "Mais calma",
      icon: Coffee,
      desc: "Foca em leitura e escrita silenciosa.",
    },
    {
      label: "Mais Interativa",
      value: "Mais interativa",
      icon: Gamepad2,
      desc: "Dinâmicas de grupo e cooperação.",
    },
    {
      label: "Ambiente Fechado",
      value: "Para ambiente fechado",
      icon: Home,
      desc: "Atividade adaptada para carteiras tradicionais.",
    },
    {
      label: "Sem Tecnologia",
      value: "Sem tecnologia",
      icon: BookOpen,
      desc: "Remove qualquer uso de telas/slides.",
    },
  ];

  const handleRegenerate = async (estilo: string) => {
    setIsRegenerating(true);
    setShowStyleMenu(false);
    setError(null);
    try {
      const res = await fetch("/api/regenerate-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema,
          disciplina,
          ano,
          tempoTotal,
          etapaNome: block.etapa,
          etapaTempo: block.tempo,
          etapaAtividade: block.atividade,
          etapaTipo: block.tipo,
          etapaObservacao: block.observacao || "",
          estiloSolicitado: estilo,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao regerar bloco.");
      }

      if (data.block) {
        onBlockUpdated(data.block);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro inesperado.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="relative border border-border/80 hover:border-primary/20 bg-card rounded-2xl overflow-hidden shadow-sm transition-all group animate-in slide-in-from-bottom-2 duration-300">
      {/* Loading Overlay */}
      {isRegenerating && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-200">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-bold text-primary animate-pulse uppercase tracking-wider">
            Reescrevendo esta etapa...
          </p>
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between bg-muted/30 px-5 py-4 border-b border-border/50 select-none">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 cursor-pointer flex-grow"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-extrabold shrink-0">
            {block.etapa.charAt(0)}
          </span>
          <div className="space-y-0.5">
            <h4 className="text-sm sm:text-base font-bold text-foreground transition-colors group-hover:text-primary">
              {block.etapa}
            </h4>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              <span>Duração recomendada: {block.tempo}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Style Selector Popup Button */}
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className="h-8 border-border hover:border-primary/20 bg-background hover:bg-muted/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <RefreshCw className="h-3 w-3 text-muted-foreground animate-spin-hover" />
              <span className="hidden sm:inline">Regerar esta parte</span>
            </Button>

            {showStyleMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowStyleMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-card border border-border/80 rounded-2xl shadow-2xl z-40 p-2 animate-in zoom-in-95 duration-200">
                  <p className="text-[10px] font-bold text-muted-foreground px-3 py-1.5 uppercase tracking-wider border-b border-border/50">
                    Escolha o tom/estilo da atividade:
                  </p>
                  <div className="grid gap-1 mt-1">
                    {styleOptions.map((opt) => {
                      const IconComp = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleRegenerate(opt.value)}
                          className="flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-muted/60 transition-all group/opt"
                        >
                          <div className="p-1.5 rounded-lg bg-primary/5 text-primary group-hover/opt:bg-primary group-hover/opt:text-white transition-colors">
                            <IconComp className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-foreground block">
                              {opt.label}
                            </span>
                            <span className="text-[9px] text-muted-foreground leading-normal block">
                              {opt.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 w-8 p-0 rounded-xl"
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded body content */}
      {isOpen && (
        <div className="p-5 space-y-4 bg-background/20">
          {error && (
            <div className="text-xs font-bold text-red-500 bg-red-500/5 border border-red-500/10 p-2 rounded-xl">
              {error}
            </div>
          )}

          {/* Activity Description */}
          <div className="space-y-1">
            <h5 className="text-xs font-extrabold text-foreground/75 uppercase tracking-wider">
              Atividade Detalhada
            </h5>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-medium">
              {block.atividade}
            </p>
          </div>

          {/* Classification type and optional tip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border/40">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                Metodologia:
              </span>
              <Badge className="bg-muted hover:bg-muted/80 text-muted-foreground border-border text-[10px] uppercase font-extrabold tracking-wide">
                {block.tipo}
              </Badge>
            </div>

            {block.observacao && (
              <div className="flex items-start gap-2 max-w-xl bg-primary/5 p-2.5 rounded-xl border border-primary/10">
                <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider block">
                    Dica de Mediação
                  </span>
                  <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
                    {block.observacao}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
