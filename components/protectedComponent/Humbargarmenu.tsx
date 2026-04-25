'use client'

import { toggleMenu } from "@/redux/slices/menuSlice"
import { RootState } from "@/redux/store"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function HamburgerMenu() {
  const dispatch = useDispatch()
  const isMenuOpen = useSelector((state: RootState) => state.menu.isOpen)

  const handleMenuToggle = () => {
    dispatch(toggleMenu())
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleMenuToggle}
      aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      aria-expanded={isMenuOpen}

    >
      <Menu className="h-6 w-6" />
    </Button>
  )
}