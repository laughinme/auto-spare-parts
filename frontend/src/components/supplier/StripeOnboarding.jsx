import React, { useEffect, useRef, useState } from 'react';
import { loadConnectAndInitialize } from '@stripe/connect-js';

export default function StripeOnboarding({ clientSecret }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unmounted = false;
    let embedded = null;

    (async () => {
      try {
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
          setError('Stripe publishable key is not configured');
          return;
        }

        const stripeConnect = await loadConnectAndInitialize({
          publishableKey,
          fetchClientSecret: async () => clientSecret,
        });

        if (unmounted) return;
        embedded = stripeConnect.create('account_onboarding');
        embedded.mount(containerRef.current);
      } catch (e) {
        console.error(e);
        setError(e?.message || 'Failed to load Stripe onboarding');
      }
    })();

    return () => {
      unmounted = true;
      try {
        embedded?.unmount?.();
      } catch {}
    };
  }, [clientSecret]);

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h2 className="text-xl font-semibold mb-3">Завершите регистрацию в Stripe</h2>
      <div ref={containerRef} />
    </div>
  );
}


