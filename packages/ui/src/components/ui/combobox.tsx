"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "../../utils";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface ComboboxOption {
  /** Unique identifier for the option */
  value: string;
  /** Display label */
  label: string;
  /** Optional description shown below the label */
  description?: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface ComboboxProps {
  /** Array of options to display */
  options: ComboboxOption[];
  /** Currently selected value */
  value?: string;
  /** Callback when selection changes */
  onValueChange?: (value: string) => void;
  /** Placeholder text when no selection */
  placeholder?: string;
  /** Placeholder for the search input */
  searchPlaceholder?: string;
  /** Text to show when no options match the search */
  emptyText?: string;
  /** Whether the combobox is disabled */
  disabled?: boolean;
  /** Whether to allow creating new options */
  allowCreate?: boolean;
  /** Label for the create new option (e.g., "Create new type") */
  createLabel?: string;
  /** Callback when user wants to create a new option */
  onCreateNew?: (searchValue: string) => void;
  /** Whether the combobox is in a loading state */
  loading?: boolean;
  /** Additional class name for the trigger button */
  className?: string;
  /** Size variant */
  size?: "sm" | "default";
  /** Content alignment */
  align?: "start" | "center" | "end";
  /** Error state */
  error?: boolean;
  /** ARIA label for accessibility */
  "aria-label"?: string;
}

/**
 * A searchable dropdown (combobox) component with optional create-new functionality.
 *
 * @example
 * ```tsx
 * <Combobox
 *   options={[
 *     { value: "1", label: "Option 1" },
 *     { value: "2", label: "Option 2", description: "With description" }
 *   ]}
 *   value={selected}
 *   onValueChange={setSelected}
 *   placeholder="Select an option..."
 *   allowCreate
 *   onCreateNew={(searchValue) => openCreateDialog(searchValue)}
 * />
 * ```
 */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  allowCreate = false,
  createLabel = "Create new",
  onCreateNew,
  loading = false,
  className,
  size = "default",
  align = "start",
  error = false,
  "aria-label": ariaLabel,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Find the selected option
  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchValue) return options;
    const search = searchValue.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(search) ||
        opt.description?.toLowerCase().includes(search),
    );
  }, [options, searchValue]);

  // Check if search matches any existing option exactly
  const exactMatch = useMemo(() => {
    if (!searchValue) return true;
    const search = searchValue.toLowerCase();
    return options.some((opt) => opt.label.toLowerCase() === search);
  }, [options, searchValue]);

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setSearchValue("");
    }
  }, [open]);

  const handleSelect = useCallback(
    (selectedValue: string) => {
      onValueChange?.(selectedValue === value ? "" : selectedValue);
      setOpen(false);
    },
    [onValueChange, value],
  );

  const handleCreateNew = useCallback(() => {
    onCreateNew?.(searchValue);
    setOpen(false);
    setSearchValue("");
  }, [onCreateNew, searchValue]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      // Allow creating with Enter when no results and create is enabled
      if (
        e.key === "Enter" &&
        allowCreate &&
        !exactMatch &&
        filteredOptions.length === 0 &&
        searchValue
      ) {
        e.preventDefault();
        handleCreateNew();
      }
    },
    [
      allowCreate,
      exactMatch,
      filteredOptions.length,
      searchValue,
      handleCreateNew,
    ],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          disabled={disabled || loading}
          className={cn(
            "w-full justify-between font-normal",
            size === "sm" && "h-8 text-sm",
            size === "default" && "h-9",
            !value && "text-muted-foreground",
            error && "border-destructive focus-visible:ring-destructive/20",
            className,
          )}
        >
          {loading ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : selectedOption ? (
            <span className="truncate">{selectedOption.label}</span>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align={align}
      >
        <Command onKeyDown={handleKeyDown}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {allowCreate && searchValue ? (
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>
                    {createLabel}: &quot;{searchValue}&quot;
                  </span>
                </button>
              ) : (
                emptyText
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                  disabled={option.disabled}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {allowCreate &&
              searchValue &&
              !exactMatch &&
              filteredOptions.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleCreateNew}
                      className="cursor-pointer"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span>
                        {createLabel}: &quot;{searchValue}&quot;
                      </span>
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
