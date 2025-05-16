"use client"

import { useEffect } from "react"

export function DialogFix() {
  useEffect(() => {
    // Find all dialog content elements without aria-describedby
    const fixDialogs = () => {
      const dialogContents = document.querySelectorAll('[role="dialog"] > [role="document"]')

      dialogContents.forEach((dialog) => {
        // Check if it already has aria-describedby
        if (!dialog.getAttribute("aria-describedby")) {
          // Create a unique ID
          const id = `dialog-desc-${Math.random().toString(36).substring(2, 9)}`

          // Add an invisible description
          const description = document.createElement("span")
          description.id = id
          description.className = "sr-only"
          description.textContent = "Dialog content"

          // Add the description to the dialog
          dialog.appendChild(description)

          // Set the aria-describedby attribute
          dialog.setAttribute("aria-describedby", id)
        }
      })
    }

    // Run on mount and whenever dialogs might change
    fixDialogs()

    // Create a mutation observer to watch for new dialogs
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          fixDialogs()
        }
      })
    })

    // Start observing
    observer.observe(document.body, { childList: true, subtree: true })

    // Clean up
    return () => observer.disconnect()
  }, [])

  return null
}
