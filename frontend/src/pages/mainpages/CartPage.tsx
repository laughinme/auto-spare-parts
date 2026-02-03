import { CartWidget } from "@/widgets/cart/ui/CartWidget"

export default function CartPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 md:px-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Корзина
          </h1>
          <p className="text-sm text-muted-foreground">
            Проверьте состав заказа, управляйте позициями и переходите к оформлению.
          </p>
        </header>

        <CartWidget />
      </div>
    </div>
  )
}
