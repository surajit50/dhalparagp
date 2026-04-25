export const convertToSequence = (number: number) => {
  let num = number;
  let result = "";
  const base = "A".charCodeAt(0) - 1;

  while (num > 0) {
    let remainder = num % 26;
    if (remainder === 0) {
      result = "Z" + result;
      num = Math.floor(num / 26) - 1;
    } else {
      result = String.fromCharCode(base + remainder) + result;
      num = Math.floor(num / 26);
    }
  }

  return result;
};

export const smallconvertToSequence = (number: number) => {
  let num = number + 1;
  let result = "";
  const base = "a".charCodeAt(0) - 1;

  while (num > 0) {
    let remainder = num % 26;
    if (remainder === 0) {
      result = "z" + result;
      num = Math.floor(num / 26) - 1;
    } else {
      result = String.fromCharCode(base + remainder) + result;
      num = Math.floor(num / 26);
    }
  }

  return result;
};
