"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { LoginSchema, LoginInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const { getSupabaseConfig } = await import("@/lib/supabase/client");
      const config = getSupabaseConfig();
      if (!config.isConfigured) {
        // Modo off-line de teste local ativo: Simula login com sucesso!
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        throw signInError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(
        err.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos. Verifique suas credenciais."
          : err.message || "Erro inesperado ao realizar login."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    setError(null);
    try {
      const { getSupabaseConfig } = await import("@/lib/supabase/client");
      const config = getSupabaseConfig();
      if (!config.isConfigured) {
        // Modo off-line de teste local ativo: Simula login Google com sucesso!
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const { error: oAuthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oAuthError) throw oAuthError;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro de login com Google.");
      setIsLoadingGoogle(false);
    }
  };

  const handleDemoAccess = () => {
    localStorage.setItem("use_mock_demo", "true");
    document.cookie = "use_mock_demo=true; path=/; max-age=86400;"; // 1 dia
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/20 via-background to-background relative overflow-hidden min-h-[calc(100vh-64px)]">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-85 h-85 bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white shadow-xl shadow-primary/10">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent uppercase tracking-wider">
            PlanejaAI
          </h2>
        </div>

        <Card className="border-border bg-card shadow-2xl relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary" />

          <CardHeader className="space-y-2 pt-8 text-center">
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              Bem-vindo de volta
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              Acesse seus planejamentos inteligentes escolares de onde estiver.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-2">
              {error && (
                <Alert
                  variant="destructive"
                  className="rounded-xl shadow-sm border-red-500/20 bg-red-500/5 animate-in shake duration-300"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-bold">Falha no Login</AlertTitle>
                  <AlertDescription className="text-xs">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    type="email"
                    placeholder="exemplo@escola.com"
                    className="pl-10 h-11 border-border bg-background/50 focus:bg-background rounded-xl"
                    {...register("email")}
                  />
                </div>
                {errors.email?.message && (
                  <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                    {String(errors.email.message)}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Sua Senha
                  </label>
                  <a
                    href="#"
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11 border-border bg-background/50 focus:bg-background rounded-xl"
                    {...register("password")}
                  />
                </div>
                {errors.password?.message && (
                  <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                    {String(errors.password.message)}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-8 pt-4">
              <Button
                type="submit"
                disabled={isLoading || isLoadingGoogle}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Acessar Painel</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              {/* Google OAuth Login */}
              <Button
                type="button"
                variant="outline"
                disabled={isLoading || isLoadingGoogle}
                onClick={handleGoogleLogin}
                className="w-full border-border hover:border-primary/20 bg-background/50 hover:bg-muted/30 font-bold h-11 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {isLoadingGoogle ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.09 14.99 0 12 0 7.354 0 3.307 2.67 1.282 6.6z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.64 12.273c0-.818-.073-1.609-.208-2.373H12v4.582h6.527a5.579 5.579 0 0 1-2.42 3.664l3.77 2.923c2.203-2.03 3.763-5.02 3.763-8.796z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.266 14.235A7.077 7.077 0 0 1 4.91 12c0-.79.13-1.554.356-2.235L1.852 6.84A11.968 11.968 0 0 0 0 12c0 1.83.411 3.565 1.137 5.12z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.958-1.077 7.947-2.915l-3.77-2.922C15.132 18.9 13.682 19.09 12 19.09c-3.155 0-5.83-2.127-6.78-4.997l-3.413 2.64A11.968 11.968 0 0 0 12 24z"
                      />
                    </svg>
                    <span>Continuar com Google</span>
                  </>
                )}
              </Button>

              {/* Demo Mode / Guest Access */}
              <div className="relative flex items-center justify-center my-1 w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/60"></div>
                </div>
                <span className="relative px-3 text-[10px] uppercase font-bold text-muted-foreground bg-card">
                  Ou experimente rápido
                </span>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={handleDemoAccess}
                className="w-full hover:bg-primary/5 hover:text-primary border border-dashed border-primary/25 hover:border-primary/40 font-extrabold h-11 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                <span>Entrar como Visitante (Modo Demo)</span>
              </Button>

              <p className="text-[11px] text-muted-foreground text-center pt-2">
                Não tem uma conta?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-primary hover:underline"
                >
                  Cadastre-se grátis
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
