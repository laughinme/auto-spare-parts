import type { CSSProperties } from "react"
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"

import { useAuth } from "@/app/providers/auth/useAuth"
import AuthPage from "@/pages/auth/ui/AuthPage"
import { SiteHeader } from "@/shared/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/components/ui/sidebar"
import { AppSidebar } from "@/widgets/sidebar/app-sidebar"
import {
  PROTECTED_ROUTES,
  ROUTE_PATHS,
  ROUTE_SECTIONS,
} from "./routes"

function ProtectedLayout() {
  const layoutStyle = {
    "--sidebar-width": "calc(var(--spacing) * 72)",
    "--header-height": "calc(var(--spacing) * 12)",
  } as CSSProperties

  return (
    <SidebarProvider style={layoutStyle}>
      <AppSidebar sections={ROUTE_SECTIONS} variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
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
        <Route element={<ProtectedLayout />}>
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
