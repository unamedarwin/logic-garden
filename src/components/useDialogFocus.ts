import { useEffect, useRef } from 'react'

const focusableSelector = [
  'button:not([disabled])',
  'select:not([disabled])',
  'input:not([disabled])',
  '[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export const useDialogFocus = (onClose?: () => void) => {
  const dialogRef = useRef<HTMLElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const dialog = dialogRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null
    if (!dialog) return
    const focusable = () => [...dialog.querySelectorAll<HTMLElement>(focusableSelector)]
    focusable()[0]?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onCloseRef.current) {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const controls = focusable()
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    dialog.addEventListener('keydown', handleKeyDown)
    return () => {
      dialog.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [])

  return dialogRef
}
