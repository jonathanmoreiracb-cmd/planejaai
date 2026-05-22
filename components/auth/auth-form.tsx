"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  CheckCircle,
} from "lucide-react";
import {
  LoginSchema,
  SignupSchema,
  LoginInput,
  SignupInput,
} from "@/lib/validators";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Type definitions based on mode
  const currentSchema = mode === "login" ? LoginSchema : SignupSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(currentSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate auth request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (mode === "signup") {
        setSuccess(
          "Conta criada com sucesso! Verifique seu e-mail para confirmação."
        );
      } else {
        setSuccess("Login efetuado com sucesso! Redirecionando...");
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-border bg-card shadow-xl overflow-hidden relative rounded-2xl">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary" />
      <CardHeader className="space-y-2 pt-8 text-center">
        <CardTitle className="text-2xl font-extrabold text-foreground tracking-tight">
          {mode === "login" ? "Entrar na sua conta" : "Criar sua conta grátis"}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {mode === "login"
            ? "Acesse seus planejamentos inteligentes de onde estiver."
            : "Comece a organizar seus objetivos com inteligência artificial hoje."}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-2">
          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertTitle>Ops! Algo deu errado</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600 rounded-xl">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertTitle className="font-bold">Sucesso!</AlertTitle>
              <AlertDescription className="text-emerald-700/80">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Name Field (Signup Only) */}
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Seu Nome
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <User className="h-4 w-4" />
                </span>
                <Input
                  type="text"
                  placeholder="Ex: John Doe"
                  className="pl-10 h-10 border-border bg-background/50 focus:bg-background rounded-xl"
                  {...register("name")}
                />
              </div>
              {errors.name?.message && (
                <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                  {String(errors.name.message)}
                </p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Endereço de E-mail
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
              </span>
              <Input
                type="email"
                placeholder="nome@exemplo.com"
                className="pl-10 h-10 border-border bg-background/50 focus:bg-background rounded-xl"
                {...register("email")}
              />
            </div>
            {errors.email?.message && (
              <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                {String(errors.email.message)}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Sua Senha
              </label>
              {mode === "login" && (
                <a
                  href="#"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Esqueceu a senha?
                </a>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Lock className="h-4 w-4" />
              </span>
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-10 h-10 border-border bg-background/50 focus:bg-background rounded-xl"
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
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/95 text-white font-semibold h-11 rounded-xl shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>{mode === "login" ? "Entrar" : "Criar Minha Conta"}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {mode === "login" ? (
              <>
                Não tem uma conta?{" "}
                <a
                  href="/signup"
                  className="font-semibold text-primary hover:underline"
                >
                  Cadastre-se grátis
                </a>
              </>
            ) : (
              <>
                Já possui uma conta?{" "}
                <a
                  href="/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Faça login
                </a>
              </>
            )}
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
