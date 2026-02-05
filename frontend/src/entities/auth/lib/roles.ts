import type { AuthUser } from "@/entities/auth/model";

const normalizeRoles = (roles: unknown): string[] => {
  if (!Array.isArray(roles)) {
    return [];
  }
  return roles.filter((role): role is string => typeof role === "string");
};

export const getUserRoles = (user?: AuthUser | null): string[] => {
  if (!user) {
    return [];
  }

  if (user.is_admin) {
    return ["admin"];
  }

  const directRoles = normalizeRoles(user.role_slugs);
  if (directRoles.length > 0) {
    return directRoles;
  }

  const altRoles = normalizeRoles(user.roles);
  if (altRoles.length > 0) {
    return altRoles;
  }

  const legacyRoles = normalizeRoles(
    (user as { roleSlugs?: unknown }).roleSlugs
  );
  return legacyRoles;
};

export const isAdminUser = (user?: AuthUser | null): boolean =>
  getUserRoles(user).includes("admin");
