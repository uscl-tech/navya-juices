"use client"

import { useState, useEffect } from "react"

export function useMobile(query = "(max-width: 768px)"): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handleResize = () => setIsMobile(mediaQuery.matches)

    // Set the initial state
    handleResize()

    // Add event listener for changes
    mediaQuery.addEventListener("change", handleResize)

    // Cleanup event listener on component unmount
    return () => {
      mediaQuery.removeEventListener("change", handleResize)
    }
  }, [query])

  return isMobile
}
