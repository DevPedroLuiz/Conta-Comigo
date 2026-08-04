import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link } from "react-router-dom"
import { resetPasswordSchema } from "../../../core/utils/schemas/auth.schemas"
import { useAuth } from "../hooks/useAuth"
import { Button } from "../../../core/ui/components/button"
import { Input } from "../../../core/ui/components/input"
import { Label } from "../../../core/ui/components/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../core/ui/components/card"
import { Alert, AlertDescription, AlertTitle } from "../../../core/ui/components/alert"
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "../../../core/ui/components/spinner"

type ForgotPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setError(null)
    try {
      await resetPassword({ email: data.email })
      setSuccess(true)
      toast.success("E-mail enviado com sucesso!")
    } catch (err: any) {
      setError(err.message || "Erro ao enviar e-mail de recuperação")
      toast.error("Erro ao enviar e-mail de recuperação")
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">E-mail enviado</CardTitle>
            <CardDescription>
              Verifique sua caixa de entrada para o link de recuperação de senha.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center border-t p-4">
            <Button variant="link" asChild>
              <Link to="/login" className="flex items-center text-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Recuperar Senha</CardTitle>
          <CardDescription>
            Digite seu e-mail e enviaremos um link para você redefinir sua senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Enviando...
                </>
              ) : (
                "Enviar link de recuperação"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <Button variant="link" asChild>
            <Link to="/login" className="flex items-center text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
