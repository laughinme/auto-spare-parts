import React from "react";
import FypPage from "../../pages/fyp/ui/FypPage.jsx";
import GarageWidget from "../../widgets/garage/ui/GarageWidget.jsx";
import SupplierStripeOnboarding from "../../pages/supplier/stripe-onboarding/ui/SupplierStripeOnboarding.jsx";
import ProductDetail from "../../entities/product/ui/ProductDetail.jsx";
import CartPage from "../../pages/cart/ui/CartPage.jsx";
import ChatPage from "../../pages/chat/ui/ChatPage.jsx";
import SupplierChatPage from "../../pages/supplier/chat/ui/SupplierChatPage.jsx";
import OrderPage from "../../pages/order/ui/OrderPage.jsx";
import SupplierDashboard from "../../pages/supplier/dashboard/ui/SupplierDashboard.jsx";
import SupplierProducts from "../../pages/supplier/products/ui/SupplierProducts.jsx";
import SupplierProductCreate from "../../pages/supplier/product-create/ui/SupplierProductCreate.jsx";
import { SUPPLIER_SELF_ID } from "../../shared/config/constants.js";

export function RouteRenderer({
  route,
  role,
  buyerType,
  garage,
  onAddVehicle,
  onRemoveVehicle,
  navigateTo,
  addToCart,
  selectedProduct,
  setSelectedProduct,
  userOrgId,
  cart,
  isCartLoading,
  isCartUpdating,
  updateQuantity,
  removeItem,
  handleCheckout,
  activeOrder,
  navigateBack,
  sendChatMessage,
  supplierProfile,
  supplierMetrics,
  setRoute,
  products,
  setProducts
}) {
  if (route === "fyp") {
    return (
      <FypPage
        role={role}
        buyerType={buyerType}
        garage={garage}
        setSelectedProduct={setSelectedProduct}
        navigateTo={navigateTo}
        onAddToCart={addToCart} />);


  }

  if (route === "garage" && role === "buyer") {
    return (
      <div className="max-w-xl mx-auto">
        <GarageWidget
          onVehicleAdded={onAddVehicle}
          onVehicleRemoved={onRemoveVehicle} />

      </div>);

  }

  if (route === "onboarding:supplier_stripe") {
    return <SupplierStripeOnboarding />;
  }

  if (route === "product" && selectedProduct) {
    return (
      <ProductDetail
        orgId={userOrgId}
        productId={selectedProduct.id}
        product={selectedProduct}
        onAdd={
        role !== "supplier" ?
        (product, quantity) => addToCart(product, quantity) :
        null
        }
        onBack={() => {
          setSelectedProduct(null);
          navigateBack();
        }}
        onChat={role !== "supplier" ? () => navigateTo("cart") : null}
        isSupplierView={role === "supplier"} />);


  }

  if (route === "cart") {
    return (
      <CartPage
        cart={cart}
        isLoading={isCartLoading}
        isMutating={isCartUpdating}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout} />);


  }

  if (route === "chat" && role !== "supplier") {
    return <ChatPage role={role} />;
  }

  if (route === "supplier:chat") {
    return <SupplierChatPage />;
  }

  if (route === "order" && activeOrder) {
    return (
      <OrderPage
        order={activeOrder}
        onBack={navigateBack}
        onSend={(text) =>
        sendChatMessage(
          activeOrder.id,
          role === "buyer" ? "buyer" : "seller",
          text
        )
        } />);


  }

  if (route === "supplier:dashboard") {
    return (
      <SupplierDashboard
        supplierProfile={supplierProfile}
        metrics={supplierMetrics}
        onNavigate={setRoute} />);


  }

  if (route === "supplier:products") {
    return (
      <SupplierProducts
        orgId={userOrgId || SUPPLIER_SELF_ID}
        products={products}
        setProducts={setProducts}
        supplierProfile={supplierProfile}
        onCreateNavigate={() => navigateTo("supplier:products:new")}
        onProductView={(product) => {
          setSelectedProduct(product);
          navigateTo("product");
        }} />);


  }

  if (route === "supplier:products:new") {
    return (
      <SupplierProductCreate
        orgId={userOrgId || SUPPLIER_SELF_ID}
        supplierProfile={supplierProfile}
        onCancel={() => navigateTo("supplier:products")}
        onCreate={(payload) => {
          const id = `p${Date.now()}`;
          const newProduct = {
            id,
            title: payload.title,
            price: Number(payload.price) || 0,
            currency: "RUB",
            supplierId: SUPPLIER_SELF_ID,
            supplierName: supplierProfile?.companyName || "My Parts Company",
            condition: "new",
            shipEtaDays: 7,
            category: "Misc",
            vehicle: payload.vehicle || "Any",
            img: payload.img
          };
          setProducts((prev) => [newProduct, ...prev]);
          navigateTo("supplier:products");
        }} />);


  }

  return null;
}