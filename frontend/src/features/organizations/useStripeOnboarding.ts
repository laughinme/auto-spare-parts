import { loadConnectAndInitialize, type StripeConnectInstance } from "@stripe/connect-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import type { OrganizationSummary } from "@/entities/auth/model";
import {
  createSupplierAccount,
  createSupplierAccountSession,
} from "@/shared/api/organizations";

type UseStripeOnboardingParams = {
  organization: OrganizationSummary | null | undefined;
};

export const getStripeOnboardingErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message || "Неизвестная ошибка";
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  return "Произошла ошибка при онбординге Stripe";
};

export const useStripeOnboarding = ({ organization }: UseStripeOnboardingParams) => {
  const publishableKey = useMemo(
    () => import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined,
    []
  );
  const queryClient = useQueryClient();
  const [accountId, setAccountId] = useState<string | null>(
    organization?.stripe_account_id ?? null,
  );
  const lastCreatedAccountIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (organization?.stripe_account_id) {
      setAccountId(organization.stripe_account_id);
      lastCreatedAccountIdRef.current = organization.stripe_account_id;
    }
  }, [organization?.stripe_account_id]);

  const createAccountMutation = useMutation({
    mutationFn: createSupplierAccount,
  });

  const createSessionMutation = useMutation({
    mutationFn: createSupplierAccountSession,
  });

  const prepareOnboarding = useCallback(async (): Promise<{
    accountId: string;
    connectInstance: StripeConnectInstance;
  }> => {
    if (!publishableKey) {
      const message = "Не настроен ключ Stripe. Обратитесь к администратору.";
      toast.error(message);
      throw new Error(message);
    }

    try {
      let currentAccountId = accountId ?? lastCreatedAccountIdRef.current;

      if (!currentAccountId) {
        const accountResponse = await createAccountMutation.mutateAsync();
        currentAccountId = accountResponse.account;
        lastCreatedAccountIdRef.current = currentAccountId;
        setAccountId(currentAccountId);
      }

      const connectInstance = loadConnectAndInitialize({
        publishableKey,
        fetchClientSecret: async () => {
          const sessionResponse = await createSessionMutation.mutateAsync({
            account: currentAccountId as string,
          });

          return sessionResponse.client_secret;
        },
      });

      return {
        accountId: currentAccountId,
        connectInstance,
      };
    } catch (error) {
      const message = getStripeOnboardingErrorMessage(error);
      toast.error(message);
      throw error;
    }
  }, [accountId, publishableKey, createAccountMutation, createSessionMutation]);

  const refreshProfile = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["me"] });
  }, [queryClient]);

  const isLoading =
    createAccountMutation.isPending ||
    createSessionMutation.isPending;

  return {
    prepareOnboarding,
    refreshProfile,
    isLoading,
  };
};
