import { useState, useEffect, useCallback } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import apiProtected from "../../api/axiosInstance.js";

export const useStripeConnect = (connectedAccountId) => {
  const [stripeConnectInstance, setStripeConnectInstance] = useState();

  const fetchClientSecret = useCallback(async () => {
    if (!connectedAccountId) return undefined;
    try {
      const { data } = await apiProtected.post("/organizations/account_session", { account: connectedAccountId });
      return data?.client_secret;
    } catch (e) {
      console.error("Failed to fetch client secret:", e);
      return undefined;
    }
  }, [connectedAccountId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!connectedAccountId) return;
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) return;
      const instance = await loadConnectAndInitialize({
        publishableKey,
        fetchClientSecret,
      });
      if (!cancelled) setStripeConnectInstance(instance);
    })();
    return () => {
      cancelled = true;
    };
  }, [connectedAccountId, fetchClientSecret]);

  return stripeConnectInstance;
};


