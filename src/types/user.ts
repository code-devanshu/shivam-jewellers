export type UserRole = "admin" | "customer";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
