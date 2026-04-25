// estimateToMB.ts
export interface MBItem {
  slNo: number;
  description: string;
  nos: number;
  length: number;
  breadth: number;
  depth: number;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export function estimateToMB(items: any[]): MBItem[] {
  return items.map((item, index) => {
    const nos = Number(item.nos || 1);
    const length = Number(item.length || 0);
    const breadth = Number(item.breadth || 0);
    const depth = Number(item.depth || 0);
    const rate = Number(item.rate || 0);

    // Use provided quantity; if not available, calculate from dimensions
    let quantity = Number(item.quantity || 0);
    if (quantity === 0 && (length > 0 || breadth > 0 || depth > 0)) {
      // Calculate: nos * L * B * D (treat 0 as 1 for multiplication)
      quantity = nos * (length || 1) * (breadth || 1) * (depth || 1);
    }
    quantity = Number(quantity.toFixed(3));

    // Use provided amount; if not available, calculate from quantity * rate
    let amount = Number(item.amount || 0);
    if (amount === 0 && rate > 0 && quantity > 0) {
      amount = Number((quantity * rate).toFixed(2));
    }

    return {
      slNo: index + 1,
      description: item.description || "",
      nos,
      length,
      breadth,
      depth,
      quantity,
      unit: item.unit || "cum",
      rate,
      amount,
    };
  });
}
