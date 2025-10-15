import { useCallback, useEffect, useState } from "react";
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem } from
"../../../shared/api/cart.js";
import { EMPTY_CART, normalizeCart } from "./cartState.js";

export function useCartManager({ user, onProductCached } = {}) {
  const [cart, setCart] = useState(EMPTY_CART);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isCartUpdating, setIsCartUpdating] = useState(false);

  const updateCartState = useCallback((cartData) => {
    setCart(normalizeCart(cartData));
  }, []);

  const resetCart = useCallback(() => {
    setCart({ ...EMPTY_CART });
    setIsCartLoading(false);
    setIsCartUpdating(false);
  }, []);

  const loadCart = useCallback(async () => {
    if (!user) {
      resetCart();
      return;
    }
    setIsCartLoading(true);
    try {
      const data = await getCart();
      updateCartState(data);
    } catch (error) {
      console.error("Не удалось загрузить корзину", error);
      resetCart();
    } finally {
      setIsCartLoading(false);
    }
  }, [resetCart, updateCartState, user]);

  useEffect(() => {
    if (user) {
      loadCart();
      return;
    }
    resetCart();
  }, [loadCart, resetCart, user]);

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!product?.id) return;
      onProductCached?.(product);
      setIsCartUpdating(true);
      try {
        const updated = await addCartItem({
          productId: product.id,
          quantity
        });
        updateCartState(updated);
      } catch (error) {
        console.error("Не удалось добавить товар в корзину", error);
      } finally {
        setIsCartUpdating(false);
      }
    },
    [onProductCached, updateCartState]
  );

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      if (!itemId) return;
      setIsCartUpdating(true);
      try {
        const updated = await updateCartItem({ itemId, quantity });
        updateCartState(updated);
      } catch (error) {
        console.error("Не удалось изменить количество в корзине", error);
      } finally {
        setIsCartUpdating(false);
      }
    },
    [updateCartState]
  );

  const removeItem = useCallback(
    async (itemId) => {
      if (!itemId) return;
      setIsCartUpdating(true);
      try {
        const updated = await removeCartItem(itemId);
        updateCartState(updated);
      } catch (error) {
        console.error("Не удалось удалить товар из корзины", error);
      } finally {
        setIsCartUpdating(false);
      }
    },
    [updateCartState]
  );

  const checkoutCart = useCallback(
    async (createOrdersFn) => {
      if (typeof createOrdersFn !== "function" || !cart.items.length) {
        return [];
      }
      const created = createOrdersFn(cart.items);
      if (!Array.isArray(created) || created.length === 0) {
        return [];
      }
      setIsCartUpdating(true);
      try {
        const cleared = await clearCart();
        updateCartState(cleared);
      } catch (error) {
        console.error(
          "Не удалось очистить корзину после оформления",
          error
        );
        updateCartState(null);
      } finally {
        setIsCartUpdating(false);
      }
      return created;
    },
    [cart.items, updateCartState]
  );

  return {
    cart,
    isCartLoading,
    isCartUpdating,
    loadCart,
    addToCart,
    updateQuantity,
    removeItem,
    checkoutCart,
    resetCart
  };
}