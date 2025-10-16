import SupplierMain from "@/pages/mainpages/supplierMain"
import type { NavSection } from "@/shared/components/nav-main"

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-1 flex-col">
    <div className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
    </div>
  </div>
)

export const ROUTE_PATHS = {
  buyer: {
    fyp: "/buyer/fyp",
    cart: "/buyer/cart",
    garage: "/buyer/garage",
    orders: "/buyer/orders",
  },
  supplier: {
    dashboard: "/supplier/dashboard",
    products: "/supplier/products",
    orders: "/supplier/orders",
  },
} as const

export const ROUTE_SECTIONS: NavSection[] = [
  {
    label: "Buyer",
    items: [
      { title: "FYP", path: ROUTE_PATHS.buyer.fyp },
      { title: "Cart", path: ROUTE_PATHS.buyer.cart },
      { title: "Garage", path: ROUTE_PATHS.buyer.garage },
      { title: "My orders", path: ROUTE_PATHS.buyer.orders },
    ],
  },
  {
    label: "Supplier",
    items: [
      { title: "Dashboard", path: ROUTE_PATHS.supplier.dashboard },
      { title: "My products", path: ROUTE_PATHS.supplier.products },
      { title: "My orders", path: ROUTE_PATHS.supplier.orders },
    ],
  },
] as const

export const PROTECTED_ROUTES = [
  {
    path: ROUTE_PATHS.supplier.dashboard,
    element: <SupplierMain />,
  },
  {
    path: ROUTE_PATHS.buyer.fyp,
    element: <PlaceholderPage title="FYP" />,
  },
  {
    path: ROUTE_PATHS.buyer.cart,
    element: <PlaceholderPage title="Cart" />,
  },
  {
    path: ROUTE_PATHS.buyer.garage,
    element: <PlaceholderPage title="Garage" />,
  },
  {
    path: ROUTE_PATHS.buyer.orders,
    element: <PlaceholderPage title="Buyer orders" />,
  },
  {
    path: ROUTE_PATHS.supplier.products,
    element: <PlaceholderPage title="My products" />,
  },
  {
    path: ROUTE_PATHS.supplier.orders,
    element: <PlaceholderPage title="Supplier orders" />,
  },
] as const
