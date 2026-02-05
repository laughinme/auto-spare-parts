import { useInfiniteQuery } from "@tanstack/react-query";

import { getAdminUsers, type AdminUsersPageDto } from "@/entities/admin/api";

export type UseAdminUsersParams = {
  banned?: boolean | null;
  search?: string | null;
  limit?: number;
  enabled?: boolean;
};

export const useAdminUsers = ({
  banned,
  search,
  limit = 50,
  enabled = true,
}: UseAdminUsersParams) =>
  useInfiniteQuery<AdminUsersPageDto>({
    queryKey: ["admin-users", { banned, search, limit }],
    queryFn: ({ pageParam }) =>
      getAdminUsers({
        banned,
        search,
        limit,
        cursor: (pageParam as string | null | undefined) ?? undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.next_cursor ?? undefined,
    enabled,
    staleTime: 30_000,
  });
