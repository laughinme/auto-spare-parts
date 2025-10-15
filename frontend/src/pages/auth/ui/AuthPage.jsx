import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../entities/user/model/useAuth.js";
import { setAccessToken as setAxiosAccessToken } from "../../../shared/api/client.js";
import { MOCK_USERS } from "../../../shared/mocks/mockUsers.js";
import { AuthBackground } from "../../../features/auth/ui/AuthBackground.jsx";
import { AuthHeader } from "../../../features/auth/ui/AuthHeader.jsx";
import { RoleSelectForm } from "../../../features/auth/ui/RoleSelectForm.jsx";
import { CredentialsForm } from "../../../features/auth/ui/CredentialsForm.jsx";

export default function AuthPage() {
  const [mode, setMode] = useState("role");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const {
    login,
    register,
    isLoggingIn,
    loginError,
    isRegistering,
    registerError
  } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const mockAccounts = useMemo(
    () => [
    {
      label: "Поставщик",
      email: MOCK_USERS.supplier.email,
      password: MOCK_USERS.supplier.password,
      icon: "П",
      themeClasses: {
        container:
        "bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200",
        badge: "bg-emerald-500",
        title: "text-emerald-800",
        subtitle: "text-emerald-600",
        button: "bg-emerald-500 text-white hover:bg-emerald-600"
      }
    },
    {
      label: "Покупатель",
      email: MOCK_USERS.buyer.email,
      password: MOCK_USERS.buyer.password,
      icon: "П",
      themeClasses: {
        container:
        "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200",
        badge: "bg-blue-500",
        title: "text-blue-800",
        subtitle: "text-blue-600",
        button: "bg-blue-500 text-white hover:bg-blue-600"
      }
    },
    {
      label: "Автоопределение",
      email: MOCK_USERS.vendor.email,
      password: MOCK_USERS.vendor.password,
      icon: "А",
      themeClasses: {
        container:
        "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200",
        badge: "bg-purple-500",
        title: "text-purple-800",
        subtitle: "text-purple-600",
        button: "bg-purple-500 text-white hover:bg-purple-600"
      }
    }],

    []
  );

  const isLoading = isLoggingIn || isRegistering;
  const error = mode === "login" ? loginError : registerError;
  const canSubmit =
  email.trim() &&
  password.trim() &&
  !isLoading && (
  mode === "login" || !!selectedRole);

  const handleRoleContinue = (event) => {
    event.preventDefault();
    if (selectedRole) {
      setMode("register");
    }
  };

  const handleMockSelect = (account) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  const handleSwitchMode = () => {
    if (mode === "login") {
      setMode("role");
      setSelectedRole(null);
    } else {
      setMode("login");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    const credentials = { email: email.trim(), password };

    try {
      if (mode === "login") {
        await login(credentials);
        return;
      }

      credentials.role = selectedRole;
      const response = await register(credentials);
      const newAccessToken = response?.access_token || null;
      if (newAccessToken) {
        setAxiosAccessToken(newAccessToken);
      }
      if (selectedRole === "buyer") {
        localStorage.setItem("userRole", "buyer");
        window.__setRoute && window.__setRoute("fyp");
      } else if (selectedRole === "supplier") {
        localStorage.setItem("userRole", "supplier");
        window.__setRoute && window.__setRoute("onboarding:supplier_stripe");
      }
    } catch (err) {
      console.error("Auth failed", err);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AuthBackground />
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div
          className={`w-full max-w-lg transform transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`
          }>

          <div className="backdrop-blur-lg bg-white/20 rounded-3xl border border-white/30 shadow-2xl p-8 relative">
            <AuthHeader mode={mode} />
            {mode === "role" ?
            <RoleSelectForm
              selectedRole={selectedRole}
              onSelectRole={setSelectedRole}
              onContinue={handleRoleContinue}
              onSwitchToLogin={() => setMode("login")} /> :


            <>
                <CredentialsForm
                mode={mode}
                email={email}
                password={password}
                error={error}
                isLoading={isLoading}
                canSubmit={canSubmit}
                onSubmit={handleSubmit}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onSwitchToMode={handleSwitchMode}
                mockAccounts={mode === "login" ? mockAccounts : undefined}
                onMockSelect={handleMockSelect} />

                <div className="text-center mt-8">
                  {mode === "login" ?
                <div className="space-y-2">
                      <p className="text-gray-600">У вас нет учетной записи?</p>
                      <button
                    className="text-indigo-600 hover:text-purple-600 transition-colors font-semibold text-lg"
                    type="button"
                    onClick={() => setMode("role")}>

                        Зарегистрироваться ✨
                      </button>
                    </div> :

                <div className="space-y-2">
                      <p className="text-gray-600">Уже есть аккаунт?</p>
                      <button
                    className="text-indigo-600 hover:text-purple-600 transition-colors font-semibold text-lg"
                    type="button"
                    onClick={() => setMode("login")}>

                        Войти 🚀
                      </button>
                    </div>
                }
                </div>
              </>
            }
          </div>
        </div>
      </div>
    </div>);

}