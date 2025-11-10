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
import SupplierProductsPage from "@/pages/mainpages/SupplierProductsPage"
import SupplierProductDetailPage from "@/pages/mainpages/SupplierProductDetailPage"
import type { NavSection } from "@/shared/components/nav-main"
import ProductDetailsPage from "@/pages/mainpages/ProductDetailsPage"
import CartPage from "@/pages/mainpages/CartPage"
import GaragePage from "@/pages/mainpages/GaragePage"
import GarageVehicleDetailsPage from "@/pages/mainpages/GarageVehicleDetailsPage"
import AccountPage from "@/pages/mainpages/AccountPage"
import OrganizationsPage from "@/pages/mainpages/OrganizationsPage"

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-1 flex-col">
    <div className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
    </div>
  </div>
)

export const ROUTE_PATHS = {
  account: {
    profile: "/account",
    organizations: "/account/organizations",
  },
  buyer: {
    fyp: "/buyer/fyp",
    productDetails: "/buyer/products/:productId",
    cart: "/buyer/cart",
    garage: "/buyer/garage",
    garageVehicleDetails: "/buyer/garage/:vehicleId",
    orders: "/buyer/orders",
  },
  supplier: {
    dashboard: "/supplier/dashboard",
    products: "/supplier/products",
    productDetails: "/supplier/products/:productId",
    orders: "/supplier/orders",
  },
} as const

export const buildProductDetailsPath = (productId: string) =>
  ROUTE_PATHS.buyer.productDetails.replace(":productId", productId)

export const buildGarageVehicleDetailsPath = (vehicleId: string) =>
  ROUTE_PATHS.buyer.garageVehicleDetails.replace(
    ":vehicleId",
    encodeURIComponent(vehicleId),
  )

export const buildSupplierProductDetailsPath = (productId: string) =>
  ROUTE_PATHS.supplier.productDetails.replace(
    ":productId",
    encodeURIComponent(productId),
  )

export const SUPPLIER_NAV_SECTION: NavSection = {
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
}

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
] as const

export const PROTECTED_ROUTES = [
  {
    path: ROUTE_PATHS.account.profile,
    element: <AccountPage />,
  },
  {
    path: ROUTE_PATHS.account.organizations,
    element: <OrganizationsPage />,
  },
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
    element: <CartPage />,
  },
  {
    path: ROUTE_PATHS.buyer.garage,
    element: <GaragePage />,
  },
  {
    path: ROUTE_PATHS.buyer.garageVehicleDetails,
    element: <GarageVehicleDetailsPage />,
  },
  {
    path: ROUTE_PATHS.buyer.orders,
    element: <PlaceholderPage title="Buyer orders" />,
  },
  {
    path: ROUTE_PATHS.supplier.products,
    element: <SupplierProductsPage />,
  },
  {
    path: ROUTE_PATHS.supplier.productDetails,
    element: <SupplierProductDetailPage />,
  },
  {
    path: ROUTE_PATHS.supplier.orders,
    element: <PlaceholderPage title="Supplier orders" />,
  },
] as const
