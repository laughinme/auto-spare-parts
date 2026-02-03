export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  [key: string]: unknown;
}

export type OrganizationType = "supplier" | "workshop";
export type KycStatus = "not_started" | "pending" | "verified" | "rejected";
export type PayoutSchedule = "daily" | "weekly" | "monthly";

export interface OrganizationSummary {
  id: string;
  type: OrganizationType;
  name: string;
  country: string;
  address: string | null;
  stripe_account_id: string | null;
  kyc_status: KycStatus;
  payout_schedule: PayoutSchedule;
  [key: string]: unknown;
}

export interface AuthUser {
  email: string;
  organization?: OrganizationSummary | null;
  [key: string]: unknown;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isUserLoading: boolean;
  isRestoringSession: boolean;
  login: (credentials: AuthCredentials) => Promise<AuthTokens>;
  register: (credentials: AuthCredentials) => Promise<AuthTokens>;
  logout: () => void;
  isLoggingIn: boolean;
  loginError: unknown;
  isRegistering: boolean;
  registerError: unknown;
}
