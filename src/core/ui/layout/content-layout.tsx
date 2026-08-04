import * as React from "react"
import { cn } from "../../../core/utils"
import { Container } from "./container"

export type ContentLayoutProps = React.ComponentProps<"div"> & {
  title?: string
  description?: string
  actions?: React.ReactNode
}

export function ContentLayout({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: ContentLayoutProps) {
  return (
    <div className={cn("py-8", className)} {...props}>
      <Container>
        {(title || actions) && (
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-1.5">
              {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        )}
        <div>{children}</div>
      </Container>
    </div>
  )
}
