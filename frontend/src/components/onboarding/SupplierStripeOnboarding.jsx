import React from "react";
import StripeOnboarding from "../stripe/StripeOnboarding.jsx";

export default function SupplierStripeOnboarding() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold mb-2 tracking-tight">Подключение выплат через Stripe</h1>
        <p className="text-slate-600">Заполните безопасную форму Stripe, чтобы получать выплаты за заказы.</p>
      </div>
      <div className="card p-4">
        <StripeOnboarding onComplete={() => {
          // Очищаем сохраненную роль после завершения onboarding
          localStorage.removeItem('userRole');
          window.__setRoute && window.__setRoute("supplier:dashboard");
        }} />
      </div>
    </div>
  );
}


