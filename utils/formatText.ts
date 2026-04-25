/**
 * Capitalizes the first letter of each word in a given string.
 * @param text - The input string to format (optional).
 * @returns The formatted string with each word capitalized.
 */
export const formatText: (text?: string) => string = (text) => {
  if (!text) return "";

  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const capitalizeFirstLetter = (string: string = "") => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
