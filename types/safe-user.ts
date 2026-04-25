import { UserRole } from "@prisma/client";

export type SafeUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
};
