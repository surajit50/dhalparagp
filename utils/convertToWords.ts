// Indian number system converter (Thousand, Lakh, Crore)

const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
];

const teens = [
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertBelowThousand(num: number): string {
  let result = '';

  const hundred = Math.floor(num / 100);
  const remainder = num % 100;

  if (hundred) {
    result += ones[hundred] + ' Hundred ';
  }

  if (remainder >= 10 && remainder < 20) {
    result += teens[remainder - 10];
  } else {
    const ten = Math.floor(remainder / 10);
    const one = remainder % 10;

    if (ten) result += tens[ten] + ' ';
    if (one) result += ones[one];
  }

  return result.trim();
}

export function convertToWords(num: number | string): string {
  let number = typeof num === 'string' ? parseInt(num, 10) : num;

  if (isNaN(number)) return '';
  if (number === 0) return 'Zero';

  if (number < 0) {
    return 'Minus ' + convertToWords(-number);
  }

  let result = '';

  const crore = Math.floor(number / 10000000);
  number %= 10000000;

  const lakh = Math.floor(number / 100000);
  number %= 100000;

  const thousand = Math.floor(number / 1000);
  number %= 1000;

  const remainder = number;

  if (crore)
    result += convertBelowThousand(crore) + ' Crore ';

  if (lakh)
    result += convertBelowThousand(lakh) + ' Lakh ';

  if (thousand)
    result += convertBelowThousand(thousand) + ' Thousand ';

  if (remainder)
    result += convertBelowThousand(remainder);

  return result.trim();
}
