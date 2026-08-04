import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import { cn } from "../../../core/utils"

export type SuccessStateProps = React.ComponentProps<"div"> & {
  title: string
  description?: string
  action?: React.ReactNode
}

export function SuccessState({
  title,
  description,
  action,
  className,
  ...props
}: SuccessStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-md border p-8 text-center animate-in fade-in-50 bg-emerald-500/5",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mb-6 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground">
            {description}
          </p>
        )}
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}
