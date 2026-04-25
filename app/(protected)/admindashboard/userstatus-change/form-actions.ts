"use server";

import {
  activateAllUsers,
  deactivateAllUsers,
  toggleUserStatus,
} from "./actions";

export async function handleActivateAll() {
  return await activateAllUsers();
}

export async function handleDeactivateAll() {
  return await deactivateAllUsers();
}

export async function handleToggleUser(
  userId: string,
  currentStatus: "active" | "inactive"
) {
  return await toggleUserStatus(userId, currentStatus);
}
