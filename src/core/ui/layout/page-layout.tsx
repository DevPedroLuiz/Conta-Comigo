import * as React from "react"
import { cn } from "../../../core/utils"

export type PageLayoutProps = React.ComponentProps<"div"> & {
  header?: React.ReactNode
  sidebar?: React.ReactNode
}

export function PageLayout({
  className,
  header,
  sidebar,
  children,
  ...props
}: PageLayoutProps) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)} {...props}>
      {header && <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">{header}</header>}
      <div className="flex flex-1 overflow-hidden">
        {sidebar && (
          <aside className="hidden w-64 shrink-0 border-r md:block overflow-y-auto bg-card">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 overflow-y-auto outline-none" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
