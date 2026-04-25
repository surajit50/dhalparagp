import { EstimateItem, MeasurableItem, MBEntry } from "./components/types";

export const getMeasurableItems = (items: EstimateItem[]): MeasurableItem[] => {
  const measurable: MeasurableItem[] = [];

  items.forEach((item) => {
    if (item.subItems && item.subItems.length > 0) {
      // Add parent as a header/container with its own values
      const parentTotalQuantity = item.subItems.reduce(
        (sum, sub) => sum + (sub.quantity || 0),
        0,
      );
      const parentTotalAmount = item.subItems.reduce(
        (sum, sub) => sum + (sub.amount || 0),
        0,
      );

      measurable.push({
        ...item,
        isHeader: true,
        displaySlNo: item.slNo.toString(),
        quantity: parentTotalQuantity,
        amount: parentTotalAmount,
      });

      // Add sub-items as measurable items with their own values
      item.subItems.forEach((sub, idx) => {
        const alphaIdx = String.fromCharCode(97 + idx); // 'a', 'b', ...

        measurable.push({
          ...sub, // Use subitem properties
          id: sub.id || `${item.id}-sub-${idx}`,
          slNo: item.slNo, // Keep parent slNo for grouping
          schedulePageNo: item.schedulePageNo, // Inherit parent properties
          description: sub.description,
          quantity: Number(sub.quantity) || 0,
          unit: sub.unit,
          rate: Number(sub.rate) || 0,
          amount: Number(sub.amount) || 0,
          isSubItem: true,
          parentId: item.id,
          subItemIndex: idx + 1,
          subItems: undefined, // Clear nested subItems
          displaySlNo: `${item.slNo}(${alphaIdx})`, // Format: 1(a), 1(b)
        });
      });
    } else {
      // Single item without subitems
      measurable.push({
        ...item,
        displaySlNo: item.slNo.toString(),
      });
    }
  });

  return measurable;
};

export const isItemMeasured = (item: MeasurableItem, mbEntries: MBEntry[]): boolean => {
  if (item.isSubItem && item.parentId) {
    return mbEntries.some((entry) => {
      if (entry.estimateItemId !== item.parentId) return false;
      if (entry.subItemId) return entry.subItemId === item.id;
      return entry.workItemDescription?.trim() === item.description?.trim();
    });
  }
  if (!item.isHeader) {
    return mbEntries.some(
      (entry) => entry.estimateItemId === item.id && !entry.subItemId,
    );
  }
  return false;
};

export const getSortedMbEntries = (mbEntries: MBEntry[], estimateItems: EstimateItem[]) => {
  return [...mbEntries].sort((a, b) => {
    const findParent = (entry: MBEntry) => {
      if (entry.estimateItemId)
        return estimateItems.find((i) => i.id === entry.estimateItemId);
      return estimateItems.find((i) =>
        i.subItems?.some((s) => s.description === entry.workItemDescription),
      );
    };

    const itemA = findParent(a);
    const itemB = findParent(b);
    const slNoA = itemA ? itemA.slNo : 99999;
    const slNoB = itemB ? itemB.slNo : 99999;

    if (slNoA !== slNoB) return slNoA - slNoB;

    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateA - dateB;
  });
};

export const getGroupedItems = (estimateItems: EstimateItem[], mbEntries: MBEntry[]) => {
  return estimateItems.reduce((acc, item) => {
    if (item.subItems && item.subItems.length > 0) {
      // This item has subitems
      const availableSubItems = item.subItems.filter((subItem) => {
        const subItemId =
          subItem.id || `${item.id}-sub-${item.subItems!.indexOf(subItem)}`;
        const isMeasured = mbEntries.some((entry) => {
          if (entry.estimateItemId !== item.id) return false;
          if (entry.subItemId) return entry.subItemId === subItemId;
          return (
            entry.workItemDescription?.trim() === subItem.description?.trim()
          );
        });
        return !isMeasured;
      });

      if (availableSubItems.length > 0) {
        acc.push({
          ...item,
          isHeader: true,
          availableSubItems: availableSubItems.map((sub, idx) => ({
            ...sub,
            id: sub.id || `${item.id}-sub-${idx}`,
            displaySlNo: `${item.slNo}(${String.fromCharCode(97 + idx)})`,
          })),
        });
      }
    } else {
      // Item without subitems
      if (
        !mbEntries.some(
          (entry) => entry.estimateItemId === item.id && !entry.subItemId,
        )
      ) {
        acc.push({
          ...item,
          isHeader: false,
        });
      }
    }
    return acc;
  }, [] as any[]);
};
