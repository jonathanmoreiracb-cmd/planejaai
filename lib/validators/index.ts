import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const SignupSchema = z
  .object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "A confirmação de senha deve ter no mínimo 6 caracteres"),
    role: z.enum(["teacher", "manager"], {
      message: "Selecione seu cargo escolar",
    }),
    acceptTerms: z.literal(true, {
      message: "Você deve aceitar os termos de uso",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const GeneratePlanSchema = z.object({
  title: z.string().min(3, "O título do plano deve ter no mínimo 3 caracteres"),
  objective: z
    .string()
    .min(10, "Descreva seu objetivo com mais detalhes (mínimo 10 caracteres)"),
  durationWeeks: z.number().min(1).max(52),
  dailyCommitmentMinutes: z.number().min(10).max(480),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  category: z.string().min(2, "Escolha uma categoria válida"),
  customNotes: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type GeneratePlanInput = z.infer<typeof GeneratePlanSchema>;
