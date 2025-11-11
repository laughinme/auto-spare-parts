import type { UserRoles } from "@/shared/api/organizations";

export type Organization = {
  id: string;
  name: string;
  country: string;
  address: string | null;
  createdAt: string;
};

export type UserPos = {
  orgId: string;
  userId: string;
  role: UserRoles;
  invitedBy:{
    id: string;
    username: string;
  }
  invitedAt: string | null;
  acceptedAt: string | null;    
}