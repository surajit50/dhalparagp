"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { fetchNitNo } from "@/action/bookNitNuber";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { blockname, gpcode, gpname, nameinprodhan, gpaddress } from "@/constants/gpinfor";
export function SearchWorkbyNitNoForm() {
  const [nitNumbers, setNitNumbers] = useState<
    { memoNumber: string; memoDate: Date }[]
  >([]);
  const [selectedNitNo, setSelectedNitNo] = useState("");
  const [selectedMemoDate, setSelectedMemoDate] = useState<Date | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchNitNumbers() {
      try {
        setIsLoading(true);
        const data = await fetchNitNo();
        setNitNumbers(data);
      } catch (error) {
        console.error("Error fetching NIT numbers:", error);
        setError("Failed to load NIT numbers. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchNitNumbers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNitNo && !isFetching) {
      setIsFetching(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        router.push(
          `/admindashboard/manage-tender/report?nitNo=${encodeURIComponent(
            selectedNitNo
          )}`
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setIsFetching(false);
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-200">
        Search Tender by NIT Number
      </h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full sm:w-[320px] justify-between rounded-lg h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading NIT Numbers...
                  </span>
                ) : selectedNitNo ? (
                  selectedNitNo
                ) : (
                  "Select NIT Number"
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[100vw] sm:w-[320px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search NIT number..."
                  className="h-10 border-b"
                />
                <CommandList>
                  <CommandEmpty className="py-4 text-center text-sm text-gray-500">
                    No matching NIT found.
                  </CommandEmpty>
                  <CommandGroup className="max-h-[240px] overflow-y-auto">
                    {nitNumbers.map(({ memoNumber, memoDate }) => (
                      <CommandItem
                        key={memoNumber}
                        value={memoNumber}
                        onSelect={(currentValue) => {
                          if (currentValue === selectedNitNo) {
                            setSelectedNitNo("");
                            setSelectedMemoDate(null);
                          } else {
                            setSelectedNitNo(currentValue);
                            const selectedItem = nitNumbers.find(
                              (item) => item.memoNumber === currentValue
                            );
                            setSelectedMemoDate(
                              selectedItem ? selectedItem.memoDate : null
                            );
                          }
                          setOpen(false);
                        }}
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 text-green-600",
                            selectedNitNo === memoNumber
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <span className="font-mono">
                          {`${memoNumber}/${gpcode}/(${memoDate.getFullYear()})`}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            type="submit"
            disabled={!selectedNitNo || isFetching}
            className="w-full sm:w-auto px-8 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
          >
            {isFetching ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </span>
            ) : (
              "Search Tender"
            )}
          </Button>
        </div>

        {selectedNitNo && !isFetching && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Selected NIT:{" "}
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {`${selectedNitNo}/${gpcode}/(${selectedMemoDate?.getFullYear()})`}
            </span>
          </p>
        )}
      </form>
    </div>
  );
}
