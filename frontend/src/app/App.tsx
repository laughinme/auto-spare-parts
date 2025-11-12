import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom"

import { useAuth } from "@/app/providers/auth/useAuth"
import AuthPage from "@/pages/auth/ui/AuthPage"
import { SiteHeader } from "@/shared/components/site-header"
import type { AuthUser } from "@/entities/auth/model"
import { useGetCartSummary } from "@/features/cart/useGetCartSummary"
import type { NavSection } from "@/shared/components/nav-main"
import {
  SupplierOnboardingDialog,
  type SupplierOnboardingDialogCloseReason,
} from "@/widgets/supplier/ui/SupplierOnboardingDialog"
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
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
  const userOrganization = user.organization ?? null
  const [headerSearch, setHeaderSearch] = useState<ReactNode>(null)
  const [lastAccessiblePath, setLastAccessiblePath] = useState<string>(
    ROUTE_PATHS.buyer.fyp,
  )
  const [pendingSupplierPath, setPendingSupplierPath] = useState<string | null>(
    null,
  )
  const [isOnboardingDialogOpen, setIsOnboardingDialogOpen] = useState(false)
  const { data: cartSummary } = useGetCartSummary()
  const cartCount = cartSummary?.totalItems ?? 0
  const navItemCounters =
    cartCount > 0 ? { [ROUTE_PATHS.buyer.cart]: cartCount } : undefined
  const lastCheckoutSearch = useRef<string | null>(null)

  const handleSetHeaderSearch = useCallback((node: ReactNode) => {
    setHeaderSearch(node)
  }, [])

  const hasSupplierAccess = Boolean(userOrganization?.id)

  const isSupplierPath = useCallback(
    (path: string) => path.startsWith("/supplier"),
    [],
  )

  useEffect(() => {
    if (!isSupplierPath(location.pathname) || hasSupplierAccess) {
      setLastAccessiblePath(location.pathname)
    }
  }, [hasSupplierAccess, isSupplierPath, location.pathname])

  useEffect(() => {
    if (!location.search || lastCheckoutSearch.current === location.search) {
      return
    }

    const params = new URLSearchParams(location.search)
    if (!params.has("session_id") && !params.has("redirect_status")) {
      return
    }

    lastCheckoutSearch.current = location.search

    const invalidateCartQueries = async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cart", false] }),
        queryClient.invalidateQueries({ queryKey: ["cart", true] }),
        queryClient.invalidateQueries({ queryKey: ["cart-summary"] }),
      ])
    }

    void invalidateCartQueries()
  }, [location.search, queryClient])

  useEffect(() => {
    if (isSupplierPath(location.pathname) && !hasSupplierAccess) {
      setPendingSupplierPath(location.pathname)
      setIsOnboardingDialogOpen(true)
      const fallback =
        lastAccessiblePath === location.pathname
          ? ROUTE_PATHS.buyer.fyp
          : lastAccessiblePath

      if (fallback !== location.pathname) {
        navigate(fallback, { replace: true })
      }
    }
  }, [
    hasSupplierAccess,
    isSupplierPath,
    lastAccessiblePath,
    location.pathname,
    navigate,
  ])

  useEffect(() => {
    if (hasSupplierAccess && pendingSupplierPath) {
      navigate(pendingSupplierPath, { replace: true })
      setPendingSupplierPath(null)
      setIsOnboardingDialogOpen(false)
    }
  }, [hasSupplierAccess, navigate, pendingSupplierPath])

  const handleNavItemSelect = useCallback(
    ({
      section,
      item,
    }: {
      section: NavSection
      item: NavSection["items"][number]
    }) => {
      if (section.label !== "Supplier") {
        return true
      }

      if (hasSupplierAccess) {
        return true
      }

      setPendingSupplierPath(item.path)
      setIsOnboardingDialogOpen(true)
      return false
    },
    [hasSupplierAccess],
  )

  const handleOnboardingDialogClose = useCallback(
    (reason: SupplierOnboardingDialogCloseReason) => {
      setIsOnboardingDialogOpen(false)

      if (reason !== "completed") {
        setPendingSupplierPath(null)
      }
    },
    [],
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader
        sections={ROUTE_SECTIONS}
        user={headerUser}
        homePath={ROUTE_PATHS.supplier.dashboard}
        searchSlot={headerSearch}
        navItemCounters={navItemCounters}
        onNavItemSelect={handleNavItemSelect}
      />
      <main className="flex flex-1 flex-col">
        <Outlet context={{ setHeaderSearch: handleSetHeaderSearch }} />
      </main>
      <SupplierOnboardingDialog
        open={isOnboardingDialogOpen}
        organization={userOrganization}
        onClose={handleOnboardingDialogClose}
      />
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
