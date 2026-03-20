# Modal Component Standards

## Overview
Foundation standards for modal/dialog components that ensure accessibility, proper focus management, and consistent user experience across overlay interfaces.

## Core Modal Interface

### Required Props
```typescript
interface ModalProps {
  // Visibility control
  open: boolean
  onClose: () => void

  // Content
  children: React.ReactNode
  title?: string
  description?: string

  // Behavior
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  preventClose?: boolean
  initialFocus?: React.RefObject<HTMLElement>

  // Variants
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  variant?: 'default' | 'centered' | 'drawer' | 'fullscreen'

  // Styling
  className?: string
  overlayClassName?: string
  contentClassName?: string

  // Accessibility
  'aria-labelledby'?: string
  'aria-describedby'?: string
}
```

## Alternative Perspective
**Counter-point**: Complex modal systems can create poor user experiences on mobile devices and may not be necessary for all applications. Sometimes simpler page-based navigation or inline editing provides better UX than overlay interfaces.

## Implementation Example

### React Implementation with Focus Management
```typescript
import React, { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const modalVariants = cva(
  "relative bg-background border shadow-lg",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        full: "max-w-full mx-4",
      },
      variant: {
        default: "rounded-lg",
        centered: "rounded-lg",
        drawer: "h-full max-h-full rounded-t-lg sm:rounded-lg sm:h-auto",
        fullscreen: "w-screen h-screen max-w-none rounded-none",
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

const overlayVariants = cva(
  "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "p-4",
        centered: "p-4",
        drawer: "items-end sm:items-center sm:p-4",
        fullscreen: "p-0",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  preventClose?: boolean
  initialFocus?: React.RefObject<HTMLElement>
  overlayClassName?: string
  contentClassName?: string
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({
    open,
    onClose,
    title,
    description,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    preventClose = false,
    initialFocus,
    size,
    variant,
    className,
    overlayClassName,
    contentClassName,
    children,
    ...props
  }, ref) => {
    const overlayRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const previousActiveElement = useRef<HTMLElement | null>(null)

    // Focus management
    useEffect(() => {
      if (open) {
        // Store the previously focused element
        previousActiveElement.current = document.activeElement as HTMLElement

        // Focus the modal content or initial focus element
        const focusElement = initialFocus?.current || contentRef.current
        if (focusElement) {
          // Small delay to ensure modal is rendered
          setTimeout(() => focusElement.focus(), 0)
        }

        // Add body class to prevent scrolling
        document.body.classList.add('modal-open')
      } else {
        // Restore focus to previously focused element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus()
        }

        // Remove body class
        document.body.classList.remove('modal-open')
      }

      return () => {
        document.body.classList.remove('modal-open')
      }
    }, [open, initialFocus])

    // Escape key handler
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && closeOnEscape && !preventClose) {
          onClose()
        }
      }

      if (open) {
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
      }
    }, [open, closeOnEscape, preventClose, onClose])

    // Focus trap
    const handleTabKey = useCallback((event: React.KeyboardEvent) => {
      if (event.key !== 'Tab' || !contentRef.current) return

      const focusableElements = contentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          event.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          event.preventDefault()
        }
      }
    }, [])

    const handleOverlayClick = (event: React.MouseEvent) => {
      if (
        event.target === overlayRef.current &&
        closeOnOverlayClick &&
        !preventClose
      ) {
        onClose()
      }
    }

    if (!open) return null

    const titleId = title ? `modal-title-${Math.random().toString(36).slice(2)}` : undefined
    const descriptionId = description ? `modal-description-${Math.random().toString(36).slice(2)}` : undefined

    const modalContent = (
      <div
        ref={overlayRef}
        className={cn(overlayVariants({ variant }), overlayClassName)}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div
          ref={contentRef}
          className={cn(modalVariants({ size, variant, className }))}
          onKeyDown={handleTabKey}
          tabIndex={-1}
          {...props}
        >
          <div className={cn("p-6", contentClassName)}>
            {/* Header */}
            {(title || description) && (
              <div className="mb-4">
                {title && (
                  <h2 id={titleId} className="text-lg font-semibold">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descriptionId} className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Content */}
            <div className="modal-body">
              {children}
            </div>
          </div>
        </div>
      </div>
    )

    // Render modal in portal to avoid z-index issues
    return createPortal(modalContent, document.body)
  }
)

Modal.displayName = "Modal"

export { Modal, modalVariants }
```

### Modal Components Collection

#### Confirmation Dialog
```typescript
// components/ui/confirmation-modal.tsx
import React from 'react'
import { Modal } from './modal'
import { Button } from './button'

interface ConfirmationModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  loading?: boolean
}

export function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm()
    if (!loading) {
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      preventClose={loading}
    >
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'primary'}
          onClick={handleConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}
```

#### Form Modal
```typescript
// components/ui/form-modal.tsx
import React from 'react'
import { Modal } from './modal'
import { Button } from './button'
import { X } from 'lucide-react'

interface FormModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  footer?: React.ReactNode
}

export function FormModal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  footer,
}: FormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size={size}
      className="relative"
    >
      {/* Close button */}
      {showCloseButton && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Header */}
      <div className="mb-6 pr-8">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-6 pt-4 border-t">
          {footer}
        </div>
      )}
    </Modal>
  )
}
```

## Modal State Management

### Modal Context Provider
```typescript
// contexts/modal-context.tsx
import React, { createContext, useContext, useState, useCallback } from 'react'

interface ModalState {
  id: string
  component: React.ComponentType<any>
  props: any
}

interface ModalContextType {
  modals: ModalState[]
  openModal: (id: string, component: React.ComponentType<any>, props?: any) => void
  closeModal: (id: string) => void
  closeAllModals: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<ModalState[]>([])

  const openModal = useCallback((id: string, component: React.ComponentType<any>, props = {}) => {
    setModals(current => {
      // Remove existing modal with same id
      const filtered = current.filter(modal => modal.id !== id)
      return [...filtered, { id, component, props }]
    })
  }, [])

  const closeModal = useCallback((id: string) => {
    setModals(current => current.filter(modal => modal.id !== id))
  }, [])

  const closeAllModals = useCallback(() => {
    setModals([])
  }, [])

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal, closeAllModals }}>
      {children}
      {/* Render modals */}
      {modals.map(({ id, component: Component, props }) => (
        <Component
          key={id}
          {...props}
          onClose={() => closeModal(id)}
        />
      ))}
    </ModalContext.Provider>
  )
}

export const useModals = () => {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModals must be used within a ModalProvider')
  }
  return context
}

// Convenience hooks
export const useConfirmation = () => {
  const { openModal, closeModal } = useModals()

  return useCallback((options: {
    title: string
    description: string
    onConfirm: () => void
    variant?: 'default' | 'destructive'
  }) => {
    const id = `confirmation-${Date.now()}`

    openModal(id, ConfirmationModal, {
      ...options,
      open: true,
    })
  }, [openModal])
}
```

## Animation and Transitions

### Modal with Framer Motion
```typescript
import { motion, AnimatePresence } from 'framer-motion'

const MotionModal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ open, variant, ...props }, ref) => {
    return (
      <AnimatePresence>
        {open && createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(overlayVariants({ variant }))}
            onClick={handleOverlayClick}
          >
            <motion.div
              ref={contentRef}
              initial={getInitialAnimation(variant)}
              animate={getAnimateAnimation(variant)}
              exit={getExitAnimation(variant)}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={cn(modalVariants({ size, variant, className }))}
              {...props}
            >
              {children}
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    )
  }
)

const getInitialAnimation = (variant: string) => {
  switch (variant) {
    case 'drawer':
      return { y: '100%', opacity: 0 }
    case 'fullscreen':
      return { scale: 0.95, opacity: 0 }
    default:
      return { scale: 0.95, opacity: 0 }
  }
}
```

## Alternative Perspective
**Counter-point**: Heavy animation and complex modal systems can negatively impact performance and accessibility. Sometimes simple, instant modals with minimal animation provide better user experience, especially for users with reduced motion preferences.

## Testing Standards

### Modal Component Tests
```typescript
describe('Modal Component', () => {
  test('renders when open is true', () => {
    render(
      <Modal open={true} onClose={jest.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  test('does not render when open is false', () => {
    render(
      <Modal open={false} onClose={jest.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('calls onClose when overlay is clicked', () => {
    const onClose = jest.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('calls onClose when escape key is pressed', () => {
    const onClose = jest.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('prevents closing when preventClose is true', () => {
    const onClose = jest.fn()
    render(
      <Modal open={true} onClose={onClose} preventClose={true} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    fireEvent.click(screen.getByRole('dialog'))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
  })

  test('manages focus correctly', () => {
    const initialButton = document.createElement('button')
    document.body.appendChild(initialButton)
    initialButton.focus()

    const { rerender } = render(
      <Modal open={true} onClose={jest.fn()} title="Test Modal">
        <button>Modal button</button>
      </Modal>
    )

    expect(document.activeElement).not.toBe(initialButton)

    rerender(
      <Modal open={false} onClose={jest.fn()} title="Test Modal">
        <button>Modal button</button>
      </Modal>
    )

    expect(document.activeElement).toBe(initialButton)
  })
})
```

This modal component standard ensures accessible, performant, and user-friendly overlay interfaces with proper focus management, keyboard navigation, and flexible content organization.