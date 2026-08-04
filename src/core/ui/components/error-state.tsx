import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "../../../core/utils"
import { Button } from "./button"

export type ErrorStateProps = React.ComponentProps<"div"> & {
  title?: string
  description?: string
  retryAction?: () => void
}

export function ErrorState({
  title = "Algo deu errado",
  description = "Não foi possível carregar o conteúdo no momento. Tente novamente mais tarde.",
  retryAction,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-md border p-8 text-center animate-in fade-in-50 bg-destructive/5",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive dark:text-red-400" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-foreground">{title}</h2>
        <p className="mb-6 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground">
          {description}
        </p>
        {retryAction && (
          <Button variant="outline" onClick={retryAction}>
            Tentar novamente
          </Button>
        )}
      </div>
    </div>
  )
}
