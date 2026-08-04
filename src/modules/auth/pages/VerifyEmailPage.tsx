import { Link, useLocation } from "react-router-dom"
import { Button } from "../../../core/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../core/ui/components/card"
import { ArrowLeft, Mail } from "lucide-react"

export function VerifyEmailPage() {
  const location = useLocation()
  const email = location.state?.email || "seu e-mail"

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Verifique seu e-mail</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para <span className="font-medium text-foreground">{email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta. 
            Se não encontrar o e-mail, verifique também a pasta de spam.
          </p>
        </CardContent>
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
