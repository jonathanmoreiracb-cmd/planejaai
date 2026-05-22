"use client";

import { SetupForm } from "@/components/setup/setup-form";
import { Sparkles, GraduationCap } from "lucide-react";

export default function SetupPage() {
  return (
    <div className="flex-grow flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/20 via-background to-background relative overflow-hidden min-h-[calc(100vh-64px)]">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 py-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white shadow-xl shadow-primary/10">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent uppercase tracking-wider">
            PlanejaAI
          </h2>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Configure seu Contexto Escolar
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
            Personalize o assistente de IA com a realidade estrutural da sua
            escola e o perfil pedagógico dos seus alunos.
          </p>
        </div>

        <SetupForm />
      </div>
    </div>
  );
}
