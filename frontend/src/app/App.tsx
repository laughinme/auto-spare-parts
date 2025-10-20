import { type ReactNode, useCallback, useState } from "react"
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"

import { useAuth } from "@/app/providers/auth/useAuth"
import AuthPage from "@/pages/auth/ui/AuthPage"
import { SiteHeader } from "@/shared/components/site-header"
import type { AuthUser } from "@/entities/auth/model"
import { useCartQuery } from "@/entities/cart/model/useCartQuery"
import {
  PROTECTED_ROUTES,
  ROUTE_PATHS,
  ROUTE_SECTIONS,
} from "./routes"

type ProtectedLayoutProps = {
  user: AuthUser
}

export type ProtectedOutletContext = {
  setHeaderSearch: (node: ReactNode) => void
}

function ProtectedLayout({ user }: ProtectedLayoutProps) {
  const email = user.email ?? ""
  const rawName =
    "name" in user && typeof user.name === "string" ? user.name : undefined
  const name =
    rawName?.trim() ||
    (email ? email.split("@")[0] : undefined) ||
    "User"
  const headerUser = {
    name,
    email,
    avatar: "/avatars/shadcn.jpg",
  }
  const [headerSearch, setHeaderSearch] = useState<ReactNode>(null)
  const { data: cart } = useCartQuery()
  const cartCount = cart?.totalItems ?? 0
  const navItemCounters =
    cartCount > 0 ? { [ROUTE_PATHS.buyer.cart]: cartCount } : undefined

  const handleSetHeaderSearch = useCallback((node: ReactNode) => {
    setHeaderSearch(node)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader
        sections={ROUTE_SECTIONS}
        user={headerUser}
        homePath={ROUTE_PATHS.supplier.dashboard}
        searchSlot={headerSearch}
        navItemCounters={navItemCounters}
      />
      <main className="flex flex-1 flex-col">
        <Outlet context={{ setHeaderSearch: handleSetHeaderSearch }} />
      </main>
    </div>
  )
}

function App() {
  const authData = useAuth()

  if (!authData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Ошибка конфигурации</h1>
          <p className="text-slate-700">
            Контекст аутентификации не найден. Убедитесь, что ваше приложение обернуто в <code>&lt;AuthProvider&gt;</code>.
          </p>
        </div>
      </div>
    )
  }

  const { user, isUserLoading, isRestoringSession } = authData

  if (isRestoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-500">Загрузка сессии...</p>
      </div>
    )
  }

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-500">Загрузка пользователя...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedLayout user={user} />}>
          <Route
            index
            element={
              <Navigate to={ROUTE_PATHS.supplier.dashboard} replace />
            }
          />
          {PROTECTED_ROUTES.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
          <Route
            path="*"
            element={
              <Navigate to={ROUTE_PATHS.supplier.dashboard} replace />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
export default function WrappedApp() {
  return (
    <>
      <App />
    </>
  )
}
