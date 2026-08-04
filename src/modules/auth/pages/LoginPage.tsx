import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { loginSchema } from "../../../core/utils/schemas/auth.schemas"
import { useAuth } from "../hooks/useAuth"
import { Button } from "../../../core/ui/components/button"
import { Input } from "../../../core/ui/components/input"
import { Label } from "../../../core/ui/components/label"
import { Checkbox } from "../../../core/ui/components/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../core/ui/components/card"
import { Alert, AlertDescription, AlertTitle } from "../../../core/ui/components/alert"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "../../../core/ui/components/spinner"

type LoginFormValues = z.infer<typeof loginSchema> & { rememberMe?: boolean }

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    },
  })

  const handleGoogleLogin = async () => {
    if (isSubmitting || isGoogleLoading) return;
    setIsGoogleLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      // Don't set isGoogleLoading to false as it redirects
    } catch (err: any) {
      toast.error("Erro ao fazer login com Google");
      setIsGoogleLoading(false);
    }
  }

  const onSubmit = async (data: LoginFormValues) => {
    setError(null)
    try {
      await login(data)
      toast.success("Login realizado com sucesso!")
      navigate("/dashboard", { replace: true })
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login")
      toast.error("Erro ao fazer login")
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Login</CardTitle>
          <CardDescription>
            Insira seu e-mail e senha para acessar sua conta
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
                <p className="text-sm text-destructive dark:text-red-400">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rememberMe" 
                onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Lembrar-me
              </Label>
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Ou continue com
                </span>
              </div>
            </div>

            <Button variant="outline" type="button" className="w-full" disabled={isSubmitting || isGoogleLoading} onClick={handleGoogleLogin}>
              {isGoogleLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Redirecionando...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                  </svg>
                  Continuar com Google
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
