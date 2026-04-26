// lib/format.ts
export const formatAadhaar = (value: string) => {
  return value
    .replace(/\D/g, "")
    .slice(0, 12)
    .replace(/(.{4})/g, "$1 ")
    .trim();
};
