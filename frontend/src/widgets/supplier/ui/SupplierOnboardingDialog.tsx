import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import type { OrganizationSummary } from "@/entities/auth/model"
import type { StripeConnectInstance } from "@stripe/connect-js"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import {
  getStripeOnboardingErrorMessage,
  useStripeOnboarding,
} from "@/features/organizations/useStripeOnboarding"

export type SupplierOnboardingDialogCloseReason =
  | "deferred"
  | "completed"
  | "cancelled"

type SupplierOnboardingDialogProps = {
  open: boolean
  organization: OrganizationSummary | null
  onClose: (reason: SupplierOnboardingDialogCloseReason) => void
}

type FlowState = "intro" | "starting" | "embedded"

const STRIPE_CONTAINER_HEIGHT = 640

export function SupplierOnboardingDialog({
  open,
  organization,
  onClose,
}: SupplierOnboardingDialogProps) {
  const {
    prepareOnboarding,
    refreshProfile,
    isLoading: isStripeApiBusy,
  } = useStripeOnboarding({ organization })

  const [flowState, setFlowState] = useState<FlowState>("intro")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const embeddedElementRef = useRef<HTMLElement | null>(null)

  const isStarting = useMemo(
    () => flowState === "starting" || isStripeApiBusy,
    [flowState, isStripeApiBusy],
  )

  const cleanupEmbeddedComponent = useCallback(() => {
    if (embeddedElementRef.current?.isConnected) {
      embeddedElementRef.current.remove()
    }
    embeddedElementRef.current = null
  }, [])

  useEffect(() => {
    if (!open) {
      cleanupEmbeddedComponent()
      setFlowState("intro")
      setErrorMessage(null)
    }
  }, [cleanupEmbeddedComponent, open])

  const handleClose = useCallback(
    (reason: SupplierOnboardingDialogCloseReason) => {
      cleanupEmbeddedComponent()
      setFlowState("intro")
      setErrorMessage(null)
      onClose(reason)
    },
    [cleanupEmbeddedComponent, onClose],
  )

  const handleOnboardingExit = useCallback(
    async (payload: unknown) => {
      const rawReason =
        (payload &&
          typeof payload === "object" &&
          "reason" in payload &&
          typeof (payload as { reason?: unknown }).reason === "string"
          ? ((payload as { reason?: string }).reason as string)
          : undefined) || undefined

      const normalizedReason = rawReason?.toLowerCase() ?? null
      const successReasons = new Set([
        "completed",
        "success",
        "returned",
        "confirmed",
        "submitted",
        "finished",
        "complete",
      ])

      try {
        await refreshProfile()
      } catch (error) {
        const message = getStripeOnboardingErrorMessage(error)
        toast.error(message)
      } finally {
        cleanupEmbeddedComponent()
      }

      if (normalizedReason && successReasons.has(normalizedReason)) {
        toast.success("Онбординг Stripe завершён")
        handleClose("completed")
        return
      }

      toast.info("Онбординг Stripe был прерван")
      handleClose("cancelled")
    },
    [cleanupEmbeddedComponent, handleClose, refreshProfile],
  )

  const mountEmbeddedComponent = useCallback(
    async (instance: StripeConnectInstance) => {
      const stripeElement = instance.create("account-onboarding")

      stripeElement.setOnLoadError?.(({ error }) => {
        const message =
          error?.message ??
          "Не удалось загрузить компонент Stripe. Попробуйте позже."
        toast.error(message)
        setErrorMessage(message)
        cleanupEmbeddedComponent()
        setFlowState("intro")
      })

      stripeElement.setOnExit?.((event) => {
        handleOnboardingExit(event).catch(() => {
          handleClose("cancelled")
        })
      })

      const container = containerRef.current
      if (container) {
        container.replaceChildren(stripeElement)
      } else {
        document.body.appendChild(stripeElement)
      }

      embeddedElementRef.current = stripeElement
      setFlowState("embedded")
    },
    [cleanupEmbeddedComponent, handleClose, handleOnboardingExit],
  )

  const handleStart = useCallback(async () => {
    setErrorMessage(null)
    setFlowState("starting")

    try {
      const { connectInstance } = await prepareOnboarding()
      await mountEmbeddedComponent(connectInstance)
    } catch (error) {
      const message = getStripeOnboardingErrorMessage(error)
      setErrorMessage(message)
      toast.error(message)
      cleanupEmbeddedComponent()
      setFlowState("intro")
    } finally {
      setComponentLoading(false)
    }
  }, [cleanupEmbeddedComponent, mountEmbeddedComponent, prepareOnboarding])

  const handleDeferred = useCallback(() => {
    if (isStarting) {
      return
    }
    handleClose("deferred")
  }, [handleClose, isStarting])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        return
      }

      if (flowState === "embedded" || flowState === "starting") {
        handleClose("cancelled")
        return
      }

      handleDeferred()
    },
    [flowState, handleClose, handleDeferred],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        {flowState === "embedded" ? null : (
          <DialogHeader>
            <DialogTitle>Стать продавцом</DialogTitle>
            <DialogDescription>
              Чтобы выкладывать товары и получать выплаты, завершите онбординг в Stripe.
            </DialogDescription>
          </DialogHeader>
        )}

        {flowState === "intro" ? (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Stripe попросит указать данные о вашей компании и банковских реквизитах. Это
              обязательный шаг перед тем, как вы сможете публиковать товары.
            </p>
            {errorMessage ? (
              <p className="text-destructive">
                {errorMessage}
              </p>
            ) : null}
          </div>
        ) : null}

        {flowState !== "intro" ? (
          <div
            ref={containerRef}
            className="min-h-[400px] rounded-lg border bg-muted/20"
            style={{ minHeight: STRIPE_CONTAINER_HEIGHT }}
          />
        ) : null}

        {flowState === "intro" ? (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeferred}
              disabled={isStarting}
            >
              Позже
            </Button>
            <Button onClick={handleStart} disabled={isStarting}>
              {isStarting ? "Подготовка..." : "Пройти онбординг"}
            </Button>
          </DialogFooter>
        ) : (
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleOnboardingExit({ reason: "cancelled" }).catch(() => {
                handleClose("cancelled")
              })
            }}
          >
            Отменить
          </Button>
        </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
