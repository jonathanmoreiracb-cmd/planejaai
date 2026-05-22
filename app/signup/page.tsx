"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { SignupSchema, SignupInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
      acceptTerms: false,
    },
  });

  const roleValue = watch("role");
  const acceptTermsValue = watch("acceptTerms");

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { error: signUpError, data: authData } = await supabase.auth.signUp(
        {
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
              role: data.role,
            },
          },
        }
      );

      if (signUpError) {
        throw signUpError;
      }

      // Check if email confirmation is required or auto-logged in
      if (authData.session) {
        setSuccess("Conta criada com sucesso! Redirecionando...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      } else {
        setSuccess(
          "Conta criada com sucesso! Enviamos um e-mail de confirmação para você ativar sua conta."
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao criar sua conta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/20 via-background to-background relative overflow-hidden min-h-[calc(100vh-64px)]">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-85 h-85 bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500 py-8">
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
              Crie sua conta grátis
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              Comece a revolucionar seus planejamentos de aula e cronogramas
              escolares hoje.
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
                  <AlertTitle className="font-bold">
                    Erro no Cadastro
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600 rounded-xl shadow-sm animate-in zoom-in-95 duration-300">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <AlertTitle className="font-bold text-emerald-600">
                    Sucesso!
                  </AlertTitle>
                  <AlertDescription className="text-xs text-emerald-700/80">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Seu Nome Completo
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </span>
                  <Input
                    type="text"
                    placeholder="Ex: John Doe"
                    className="pl-10 h-11 border-border bg-background/50 focus:bg-background rounded-xl"
                    {...register("name")}
                  />
                </div>
                {errors.name?.message && (
                  <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                    {String(errors.name.message)}
                  </p>
                )}
              </div>

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

              {/* Grid Passwords */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Password field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Senha
                  </label>
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

                {/* Confirm Password field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-11 border-border bg-background/50 focus:bg-background rounded-xl"
                      {...register("confirmPassword")}
                    />
                  </div>
                  {errors.confirmPassword?.message && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                      {String(errors.confirmPassword.message)}
                    </p>
                  )}
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Cargo Escolar
                </label>
                <Select
                  value={roleValue}
                  onValueChange={(val) => setValue("role", val)}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-background/50 focus:bg-background border-border">
                    <SelectValue placeholder="Selecione seu cargo..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="teacher">Sou professor(a)</SelectItem>
                    <SelectItem value="manager">Sou gestora escolar</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role?.message && (
                  <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                    {String(errors.role.message)}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="space-y-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    className="h-4.5 w-4.5 accent-primary border-border bg-background rounded-md shrink-0 cursor-pointer mt-0.5"
                    checked={acceptTermsValue}
                    onChange={(e) =>
                      setValue("acceptTerms", e.target.checked, {
                        shouldValidate: true,
                      })
                    }
                  />
                  <span className="text-[11px] text-muted-foreground leading-normal">
                    Li e concordo com os{" "}
                    <a
                      href="#"
                      className="font-bold text-primary hover:underline"
                    >
                      Termos de Uso
                    </a>{" "}
                    e{" "}
                    <a
                      href="#"
                      className="font-bold text-primary hover:underline"
                    >
                      Políticas de Privacidade
                    </a>{" "}
                    da plataforma.
                  </span>
                </label>
                {errors.acceptTerms?.message && (
                  <p className="text-[10px] text-red-500 font-semibold">
                    {String(errors.acceptTerms.message)}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-8 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Criar Minha Conta</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                Já possui uma conta?{" "}
                <Link
                  href="/login"
                  className="font-bold text-primary hover:underline"
                >
                  Faça login
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
