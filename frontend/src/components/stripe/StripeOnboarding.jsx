import React, { useEffect, useState } from "react";
import { ConnectAccountOnboarding, ConnectComponentsProvider } from "@stripe/react-connect-js";
import { useStripeConnect } from "./useStripeConnect.jsx";
import apiProtected from "../../api/axiosInstance.js";

export default function StripeOnboarding({ onComplete }) {
  const [connectedAccountId, setConnectedAccountId] = useState();
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [error, setError] = useState(false);
  const stripeConnectInstance = useStripeConnect(connectedAccountId);

  useEffect(() => {
    const createConnectedAccount = async () => {
      setAccountCreatePending(true);
      setError(false);
      try {
        const { data } = await apiProtected.post("/organizations/account");
        if (data?.account) {
          setConnectedAccountId(data.account);
        } else {
          setError(true);
        }
      } catch (e) {
        setError(true);
        console.error("Failed to create connected account:", e);
      } finally {
        setAccountCreatePending(false);
      }
    };
    createConnectedAccount();
  }, []);

  if (accountCreatePending) {
    return <p>Создаем ваш счет продавца...</p>;
  }

  if (error) {
    return <p className="error">Произошла ошибка. Попробуйте снова.</p>;
  }

  if (stripeConnectInstance) {
    return (
      <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
        <ConnectAccountOnboarding onExit={onComplete} />
      </ConnectComponentsProvider>
    );
  }

  return <p>Загрузка формы...</p>;
}


