import * as React from "react"
import { cn } from "../../../core/utils"

export type ContainerProps = React.ComponentProps<"div"> & {
  as?: React.ElementType
}

export function Container({
  className,
  as: Component = "div",
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  )
}
