import React, { useState } from "react"
import { useForm, FormProvider, useFormContext } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Check, ChevronRight, Monitor, Moon, Sun } from "lucide-react"

import { onboardingSchema, OnboardingData, DEFAULT_CATEGORIES } from "../schemas/onboarding.schemas"
import { onboardingService } from "../services/OnboardingService"
import { useAuth, useUser } from "../../auth/hooks/useAuth"

import { Button } from "../../../core/ui/components/button"
import { Input } from "../../../core/ui/components/input"
import { Label } from "../../../core/ui/components/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../core/ui/components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../core/ui/components/select"
import { Spinner } from "../../../core/ui/components/spinner"
import { Separator } from "../../../core/ui/components/separator"
import { Badge } from "../../../core/ui/components/badge"

const steps = [
  { id: 'welcome', title: 'Boas-vindas' },
  { id: 'settings', title: 'Configurações' },
  { id: 'profile', title: 'Perfil' },
  { id: 'account', title: 'Conta' },
  { id: 'categories', title: 'Categorias' },
  { id: 'finish', title: 'Concluir' },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { authState } = useAuth() // Assuming we might need user info
  const user = useUser()
  const [currentStep, setCurrentStep] = useState(0)

  const methods = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      currency: "BRL",
      language: "pt-BR",
      dateFormat: "DD/MM/YYYY",
      firstDayOfWeek: "0",
      theme: "system",
      fullName: "",
      avatar: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo",
      accountName: "Carteira Principal",
      accountType: "WALLET",
      initialBalance: 0,
      accountColor: "#4F46E5",
      accountIcon: "wallet",
      categories: DEFAULT_CATEGORIES,
    },
  })

  const { handleSubmit, trigger, formState: { isSubmitting } } = methods

  const nextStep = async () => {
    let fieldsToValidate: any = []
    
    if (currentStep === 1) fieldsToValidate = ['currency', 'language', 'dateFormat', 'firstDayOfWeek', 'theme']
    if (currentStep === 2) fieldsToValidate = ['fullName', 'timezone']
    if (currentStep === 3) fieldsToValidate = ['accountName', 'accountType', 'initialBalance']
    if (currentStep === 4) fieldsToValidate = ['categories']

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate)
      if (!isValid) return
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const onSubmit = async (data: OnboardingData) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    try {
      const result = await onboardingService.completeOnboarding(user.id, data)
      
      if (result.error) {
        toast.error("Erro ao salvar configurações")
      } else {
        toast.success("Configuração concluída!")
        navigate("/dashboard")
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado")
    }
  }

  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Configuração Inicial</CardTitle>
              <CardDescription>
                Passo {currentStep + 1} de {steps.length}: {steps[currentStep].title}
              </CardDescription>
              <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="bg-primary transition-all duration-300 ease-in-out"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="min-h-[400px]">
              {currentStep === 0 && <WelcomeStep />}
              {currentStep === 1 && <SettingsStep />}
              {currentStep === 2 && <ProfileStep />}
              {currentStep === 3 && <AccountStep />}
              {currentStep === 4 && <CategoriesStep />}
              {currentStep === 5 && <FinishStep />}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
              >
                Voltar
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" /> Salvando...
                    </>
                  ) : (
                    "Finalizar e Ir para o Dashboard"
                  )}
                </Button>
              )}
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </div>
  )
}

function WelcomeStep() {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4 text-center animate-in fade-in slide-in-from-bottom-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Monitor className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Bem-vindo(a) ao Conta Comigo!</h2>
      <p className="text-muted-foreground max-w-[80%] mx-auto">
        Estamos muito felizes em ter você aqui. Vamos configurar sua conta rapidamente 
        para que você possa começar a gerenciar suas finanças com facilidade e inteligência.
      </p>
    </div>
  )
}

function SettingsStep() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<OnboardingData>()
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currency">Moeda Padrão</Label>
          <Select 
            value={watch("currency")} 
            onValueChange={(val) => setValue("currency", val, { shouldValidate: true })}
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder="Selecione a moeda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">Real (R$)</SelectItem>
              <SelectItem value="USD">Dólar (US$)</SelectItem>
              <SelectItem value="EUR">Euro (€)</SelectItem>
            </SelectContent>
          </Select>
          {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Idioma</Label>
          <Select 
            value={watch("language")} 
            onValueChange={(val) => setValue("language", val, { shouldValidate: true })}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Selecione o idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
            </SelectContent>
          </Select>
          {errors.language && <p className="text-sm text-destructive">{errors.language.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateFormat">Formato de Data</Label>
          <Select 
            value={watch("dateFormat")} 
            onValueChange={(val) => setValue("dateFormat", val, { shouldValidate: true })}
          >
            <SelectTrigger id="dateFormat">
              <SelectValue placeholder="Selecione o formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstDayOfWeek">Primeiro Dia da Semana</Label>
          <Select 
            value={watch("firstDayOfWeek")} 
            onValueChange={(val) => setValue("firstDayOfWeek", val, { shouldValidate: true })}
          >
            <SelectTrigger id="firstDayOfWeek">
              <SelectValue placeholder="Selecione o dia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Domingo</SelectItem>
              <SelectItem value="1">Segunda-feira</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <Label>Tema de Preferência</Label>
        <div className="grid grid-cols-3 gap-4">
          <ThemeOption value="light" icon={<Sun className="h-5 w-5" />} label="Claro" />
          <ThemeOption value="dark" icon={<Moon className="h-5 w-5" />} label="Escuro" />
          <ThemeOption value="system" icon={<Monitor className="h-5 w-5" />} label="Sistema" />
        </div>
      </div>
    </div>
  )
}

function ThemeOption({ value, icon, label }: { value: string, icon: React.ReactNode, label: string }) {
  const { watch, setValue } = useFormContext<OnboardingData>()
  const selected = watch("theme") === value
  return (
    <div
      onClick={() => setValue("theme", value as any, { shouldValidate: true })}
      className={`flex cursor-pointer flex-col items-center justify-center space-y-2 rounded-md border-2 p-4 transition-all hover:bg-accent ${selected ? "border-primary bg-primary/5" : "border-muted"}`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

function ProfileStep() {
  const { register, watch, formState: { errors } } = useFormContext<OnboardingData>()
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input 
          id="fullName" 
          placeholder="Ex: João da Silva" 
          {...register("fullName")} 
        />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar">Foto de Perfil (URL Opcional)</Label>
        <Input 
          id="avatar" 
          placeholder="https://exemplo.com/foto.jpg" 
          {...register("avatar")} 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Fuso Horário</Label>
        <Input 
          id="timezone" 
          {...register("timezone")} 
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Detectado automaticamente pelo seu navegador.</p>
      </div>
    </div>
  )
}

function AccountStep() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<OnboardingData>()
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="rounded-lg bg-primary/5 p-4 text-sm text-primary">
        Vamos criar sua primeira conta financeira para você já começar a registrar suas transações.
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="accountName">Nome da Conta</Label>
        <Input 
          id="accountName" 
          placeholder="Ex: Conta Corrente Itaú" 
          {...register("accountName")} 
        />
        {errors.accountName && <p className="text-sm text-destructive">{errors.accountName.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="accountType">Tipo de Conta</Label>
          <Select 
            value={watch("accountType")} 
            onValueChange={(val) => setValue("accountType", val, { shouldValidate: true })}
          >
            <SelectTrigger id="accountType">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CHECKING_ACCOUNT">Conta Corrente</SelectItem>
              <SelectItem value="SAVINGS_ACCOUNT">Conta Poupança</SelectItem>
              <SelectItem value="CASH">Carteira (Dinheiro)</SelectItem>
              <SelectItem value="INVESTMENT">Investimento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="initialBalance">Saldo Inicial</Label>
          <Input 
            id="initialBalance" 
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("initialBalance", { valueAsNumber: true })} 
          />
          {errors.initialBalance && <p className="text-sm text-destructive">{errors.initialBalance.message}</p>}
        </div>
      </div>
    </div>
  )
}

function CategoriesStep() {
  const { watch } = useFormContext<OnboardingData>()
  const categories = watch("categories")

  const expenses = categories.filter(c => c.type === "EXPENSE")
  const incomes = categories.filter(c => c.type === "INCOME")

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-sm text-muted-foreground">
        Preparamos algumas categorias padrão para facilitar seu uso. Você poderá editar, excluir e criar novas categorias a qualquer momento depois.
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-semibold flex items-center">
            <span className="w-2 h-2 rounded-full bg-destructive mr-2"></span>
            Despesas
          </h3>
          <div className="flex flex-wrap gap-2">
            {expenses.map((cat, i) => (
              <Badge key={i} variant="outline" className="px-3 py-1" style={{ borderColor: cat.color }}>
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 font-semibold flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            Receitas
          </h3>
          <div className="flex flex-wrap gap-2">
            {incomes.map((cat, i) => (
              <Badge key={i} variant="outline" className="px-3 py-1" style={{ borderColor: cat.color }}>
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FinishStep() {
  const { watch } = useFormContext<OnboardingData>()
  const data = watch()
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-6 text-center animate-in fade-in slide-in-from-bottom-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
        <Check className="h-10 w-10 text-emerald-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Tudo Pronto, {data.fullName.split(' ')[0]}!</h2>
        <p className="text-muted-foreground max-w-[80%] mx-auto">
          Suas configurações foram salvas. Clique em Finalizar para ir ao seu novo painel de controle.
        </p>
      </div>
    </div>
  )
}
