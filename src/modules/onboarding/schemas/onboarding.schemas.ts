import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["INCOME", "EXPENSE"]),
  color: z.string().optional(),
  icon: z.string().optional(),
  is_default: z.boolean().optional(),
});

export const onboardingSchema = z.object({
  // Preferences
  currency: z.string().min(1, "Moeda é obrigatória"),
  language: z.string().min(1, "Idioma é obrigatório"),
  dateFormat: z.string().min(1, "Formato de data é obrigatório"),
  firstDayOfWeek: z.string().min(1, "Primeiro dia da semana é obrigatório"),
  theme: z.enum(["light", "dark", "system"]),
  
  // Profile
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  avatar: z.string().optional(),
  timezone: z.string().min(1, "Fuso horário é obrigatório"),

  // Initial Account
  accountName: z.string().min(1, "Nome da conta é obrigatório"),
  accountType: z.string().min(1, "Tipo de conta é obrigatório"),
  initialBalance: z.number({
    error: "Valor deve ser numérico"
  }),
  accountColor: z.string().optional(),
  accountIcon: z.string().optional(),

  // Categories
  categories: z.array(categorySchema),
});

export type CategoryData = z.infer<typeof categorySchema>;
export type OnboardingData = z.infer<typeof onboardingSchema>;

export const DEFAULT_CATEGORIES: CategoryData[] = [
  { id: "c1", name: "Moradia", type: "EXPENSE", color: "#EF4444", icon: "home" },
  { id: "c2", name: "Alimentação", type: "EXPENSE", color: "#F97316", icon: "coffee" },
  { id: "c3", name: "Transporte", type: "EXPENSE", color: "#EAB308", icon: "car" },
  { id: "c4", name: "Saúde", type: "EXPENSE", color: "#10B981", icon: "heart" },
  { id: "c5", name: "Lazer", type: "EXPENSE", color: "#3B82F6", icon: "smile" },
  { id: "c6", name: "Salário", type: "INCOME", color: "#14B8A6", icon: "briefcase" },
  { id: "c7", name: "Investimentos", type: "INCOME", color: "#8B5CF6", icon: "trending-up" },
];
