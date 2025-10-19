import { useQuery } from "@tanstack/react-query";

import { getCart } from "@/shared/api/cart";

import { toCart } from "./adapters";

type UseCartQueryOptions = {
  includeLocked?: boolean;
};

export function useCartQuery(options: UseCartQueryOptions = {}) {
  const includeLocked = Boolean(options.includeLocked);

  return useQuery({
    queryKey: ["cart", includeLocked],
    queryFn: () =>
      getCart(includeLocked ? { include_locked: true } : undefined),
    select: toCart,
  });
}
