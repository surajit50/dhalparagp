import { BillAbstractEntry, EstimateItem, DisplayItem } from "./types";

export const getDisplayItems = (
  billEntries: BillAbstractEntry[],
  estimateItems: EstimateItem[],
): DisplayItem[] => {
  if (!billEntries.length) return [];

  const displayItems: DisplayItem[] = [];
  const entryGroups = new Map<string, BillAbstractEntry[]>();

  billEntries.forEach((entry) => {
    if (entry.estimateItemId) {
      const existing = entryGroups.get(entry.estimateItemId) || [];
      entryGroups.set(entry.estimateItemId, [...existing, entry]);
    }
  });

  estimateItems.forEach((estItem) => {
    const group = entryGroups.get(estItem.id);

    if (group && group.length > 0) {
      if (estItem.subItems && estItem.subItems.length > 0) {
        const groupTotalAmount = group.reduce(
          (sum, e) => sum + (Number(e.amount) || 0),
          0,
        );

        displayItems.push({
          isHeader: true,
          slNo: estItem.slNo.toString(),
          description: estItem.description,
          mbNumber: "",
          mbPageNumber: "",
          quantity: "",
          unit: "",
          rate: "",
          amount: groupTotalAmount,
        });

        estItem.subItems.forEach((sub, subIdx) => {
          const subEntry = group.find(
            (e) =>
              e.subItemId === sub.id ||
              e.workItemDescription === sub.description,
          );

          if (subEntry) {
            const originalIndex = billEntries.findIndex((e) => e === subEntry);
            displayItems.push({
              isHeader: false,
              slNo: `${String.fromCharCode(97 + subIdx)})`,
              description: sub.description,
              mbNumber: subEntry.mbNumber,
              mbPageNumber: subEntry.mbPageNumber,
              quantity: subEntry.quantityExecuted,
              unit: subEntry.unit,
              rate: subEntry.rate,
              amount: subEntry.amount,
              entryIndex: originalIndex,
              originalEntry: subEntry,
              isSubItem: true,
            });
          }
        });
      } else {
        group.forEach((entry) => {
          const originalIndex = billEntries.findIndex((e) => e === entry);
          displayItems.push({
            isHeader: false,
            slNo: estItem.slNo.toString(),
            description: estItem.description,
            mbNumber: entry.mbNumber,
            mbPageNumber: entry.mbPageNumber,
            quantity: entry.quantityExecuted,
            unit: entry.unit,
            rate: entry.rate,
            amount: entry.amount,
            entryIndex: originalIndex,
            originalEntry: entry,
          });
        });
      }
    }
  });

  if (estimateItems.length === 0 && billEntries.length > 0) {
    return billEntries.map((entry, idx) => ({
      isHeader: false,
      slNo: (idx + 1).toString(),
      description: entry.workItemDescription,
      mbNumber: entry.mbNumber,
      mbPageNumber: entry.mbPageNumber,
      quantity: entry.quantityExecuted,
      unit: entry.unit,
      rate: entry.rate,
      amount: entry.amount,
      entryIndex: idx,
      originalEntry: entry,
    }));
  }

  const specificIdsProcessed = new Set<string>();
  displayItems.forEach((d) => {
    if (d.originalEntry && d.originalEntry.mbEntryId)
      specificIdsProcessed.add(d.originalEntry.mbEntryId);
  });

  billEntries.forEach((entry, idx) => {
    if (!specificIdsProcessed.has(entry.mbEntryId)) {
      displayItems.push({
        isHeader: false,
        slNo: (idx + 1).toString(),
        description: entry.workItemDescription,
        mbNumber: entry.mbNumber,
        mbPageNumber: entry.mbPageNumber,
        quantity: entry.quantityExecuted,
        unit: entry.unit,
        rate: entry.rate,
        amount: entry.amount,
        entryIndex: idx,
        originalEntry: entry,
      });
    }
  });

  return displayItems;
};

export const calculateItemwiseTotal = (billEntries: BillAbstractEntry[]) => {
  return billEntries.reduce(
    (sum, entry) => sum + (Number(entry.amount) || 0),
    0,
  );
};
