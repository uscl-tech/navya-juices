import React from "react"
import { DialogContent as ShadcnDialogContent, type DialogContentProps } from "@/components/ui/dialog"

// This is a wrapper around the shadcn DialogContent that ensures it has an aria-describedby
export function AccessibleDialogContent({
  children,
  "aria-describedby": ariaDescribedBy,
  ...props
}: DialogContentProps) {
  // Generate a unique ID if none is provided
  const generatedId = React.useId()
  const describedById = ariaDescribedBy || generatedId

  // Find if there's already a DialogDescription in the children
  const hasDescription = React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.type && (child.type as any).displayName === "DialogDescription",
  )

  // If there's no description, we'll add an invisible one
  const enhancedChildren = hasDescription ? (
    children
  ) : (
    <>
      {children}
      <span id={describedById} className="sr-only">
        Dialog content
      </span>
    </>
  )

  return (
    <ShadcnDialogContent aria-describedby={describedById} {...props}>
      {enhancedChildren}
    </ShadcnDialogContent>
  )
}
