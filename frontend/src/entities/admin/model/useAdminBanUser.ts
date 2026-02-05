import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import {
  setAdminUserBanned,
  type AdminUserDto,
  type AdminUsersPageDto,
} from "@/entities/admin/api";

export type AdminBanUserVariables = {
  userId: string;
  banned: boolean;
};

export const useAdminBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation<AdminUserDto, unknown, AdminBanUserVariables>({
    mutationFn: ({ userId, banned }) =>
      setAdminUserBanned(userId, { banned }),
    onSuccess: (updatedUser) => {
      queryClient.setQueriesData<InfiniteData<AdminUsersPageDto>>(
        { queryKey: ["admin-users"] },
        (current) => {
          if (!current) {
            return current;
          }
          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === updatedUser.id ? updatedUser : item
              ),
            })),
          };
        }
      );
    },
  });
};
