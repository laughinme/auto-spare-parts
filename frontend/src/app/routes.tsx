import {
  BackpackIcon,
  BarChartIcon,
  BoxIcon,
  CardStackIcon,
  ClipboardIcon,
  StarIcon,
} from "@radix-ui/react-icons"
import FypPage from "@/pages/mainpages/fyp"
import SupplierMain from "@/pages/mainpages/supplierMain"
import type { NavSection } from "@/shared/components/nav-main"
import ProductDetailsPage from "@/pages/mainpages/ProductDetailsPage"

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
    productDetails: "/buyer/products/:productId",
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

export const buildProductDetailsPath = (productId: string) =>
  ROUTE_PATHS.buyer.productDetails.replace(":productId", productId)

export const ROUTE_SECTIONS: NavSection[] = [
  {
    label: "Buyer",
    items: [
      {
        title: "FYP",
        path: ROUTE_PATHS.buyer.fyp,
        icon: StarIcon,
      },
      {
        title: "Cart",
        path: ROUTE_PATHS.buyer.cart,
        icon: BackpackIcon,
      },
      {
        title: "Garage",
        path: ROUTE_PATHS.buyer.garage,
        icon: BoxIcon,
      },
      {
        title: "My orders",
        path: ROUTE_PATHS.buyer.orders,
        icon: ClipboardIcon,
      },
    ],
  },
  {
    label: "Supplier",
    items: [
      {
        title: "Dashboard",
        path: ROUTE_PATHS.supplier.dashboard,
        icon: BarChartIcon,
      },
      {
        title: "My products",
        path: ROUTE_PATHS.supplier.products,
        icon: CardStackIcon,
      },
      {
        title: "My orders",
        path: ROUTE_PATHS.supplier.orders,
        icon: ClipboardIcon,
      },
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
    element: <FypPage />,
  },
  {
    path: ROUTE_PATHS.buyer.productDetails,
    element: <ProductDetailsPage />,
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
