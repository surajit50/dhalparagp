export function staticBlurDataUrl() {
  const blurSvg = `<svg xmlns='http://www.w3.org/svg' viewBox='0 0 8 5'>
 
    <filter id="b" color-interpalation-filters='sRBG'>
      <feGaussianBlur  stdDeviation='1' />
    </filter>
 
  <rect preserveAspectRatio='none' filter='url(#b)' x='0' y='0' height='height='100%' width='100%' stroke-width="3" stroke="#7b9fa6" fill="#426874" />
</svg>`;

  const toBase64 = () =>
    typeof window === "undefined"
      ? Buffer.from(str).toString("base64")
      : window.btoa(str);

  return `data:image/svg+xml;base64,${blurSvg}`;
}
