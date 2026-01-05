"use client";

import { Check, Loader2, Plus, X } from "lucide-react";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "../../utils";
import { Button } from "./button";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";

export interface AutocompleteOption {
  /** Unique identifier for the option */
  value: string;
  /** Display label */
  label: string;
  /** Optional description shown below the label */
  description?: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface AutocompleteProps {
  /** Array of options to display */
  options: AutocompleteOption[];
  /** Currently selected value */
  value?: string;
  /** Callback when selection changes */
  onValueChange?: (value: string) => void;
  /** Placeholder text when no selection */
  placeholder?: string;
  /** Text to show when no options match the search */
  emptyText?: string;
  /** Whether the autocomplete is disabled */
  disabled?: boolean;
  /** Whether to allow creating new options */
  allowCreate?: boolean;
  /** Label for the create new option (e.g., "Create new type") */
  createLabel?: string;
  /** Callback when user wants to create a new option */
  onCreateNew?: (searchValue: string) => void;
  /** Whether the autocomplete is in a loading state */
  loading?: boolean;
  /** Additional class name for the input */
  className?: string;
  /** Error state */
  error?: boolean;
  /** ARIA label for accessibility */
  "aria-label"?: string;
  /** Input id */
  id?: string;
  /** Input name */
  name?: string;
}

/**
 * An autocomplete input component that shows suggestions as you type,
 * with optional create-new functionality embedded in the dropdown.
 *
 * @example
 * ```tsx
 * <Autocomplete
 *   options={[
 *     { value: "1", label: "Option 1" },
 *     { value: "2", label: "Option 2", description: "With description" }
 *   ]}
 *   value={selected}
 *   onValueChange={setSelected}
 *   placeholder="Type to search..."
 *   allowCreate
 *   onCreateNew={(searchValue) => openCreateDialog(searchValue)}
 * />
 * ```
 */
export function Autocomplete({
  options,
  value,
  onValueChange,
  placeholder = "Type to search...",
  emptyText = "No results found.",
  disabled = false,
  allowCreate = false,
  createLabel = "Create new",
  onCreateNew,
  loading = false,
  className,
  error = false,
  "aria-label": ariaLabel,
  id,
  name,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Find the selected option
  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  // Sync input value with selected option when selection changes externally
  useEffect(() => {
    if (selectedOption && !open) {
      setInputValue(selectedOption.label);
    } else if (!value && !open) {
      setInputValue("");
    }
  }, [selectedOption, value, open]);

  // Filter options based on input
  const filteredOptions = useMemo(() => {
    if (!inputValue) return options;
    const search = inputValue.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(search) ||
        opt.description?.toLowerCase().includes(search),
    );
  }, [options, inputValue]);

  // Check if search matches any existing option exactly
  const exactMatch = useMemo(() => {
    if (!inputValue) return true;
    const search = inputValue.toLowerCase();
    return options.some((opt) => opt.label.toLowerCase() === search);
  }, [options, inputValue]);

  // Show create option when typing and no exact match
  const showCreateOption = allowCreate && !!inputValue && !exactMatch;

  // Total items including create option
  const totalItems = filteredOptions.length + (showCreateOption ? 1 : 0);

  // Only show popover if there's something to display
  const hasContent = filteredOptions.length > 0 || showCreateOption;
  const effectiveOpen = open && hasContent;

  // Reset highlighted index when options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, []);

  const handleSelect = useCallback(
    (selectedValue: string, label: string) => {
      onValueChange?.(selectedValue);
      setInputValue(label);
      setOpen(false);
      setHighlightedIndex(-1);
    },
    [onValueChange],
  );

  const handleCreateNew = useCallback(() => {
    onCreateNew?.(inputValue);
    setOpen(false);
    setHighlightedIndex(-1);
  }, [onCreateNew, inputValue]);

  const handleClear = useCallback(() => {
    onValueChange?.("");
    setInputValue("");
    setOpen(false);
    inputRef.current?.focus();
  }, [onValueChange]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setOpen(true);
  }, []);

  const handleInputFocus = useCallback(() => {
    setOpen(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!open) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < totalItems - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0) {
            if (
              showCreateOption &&
              highlightedIndex === filteredOptions.length
            ) {
              // Create option is highlighted
              handleCreateNew();
            } else if (highlightedIndex < filteredOptions.length) {
              const option = filteredOptions[highlightedIndex];
              if (!option.disabled) {
                handleSelect(option.value, option.label);
              }
            }
          } else if (showCreateOption && filteredOptions.length === 0) {
            // No results but can create
            handleCreateNew();
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          setHighlightedIndex(-1);
          // Restore the selected option's label if there was one
          if (selectedOption) {
            setInputValue(selectedOption.label);
          }
          break;
        case "Tab":
          setOpen(false);
          break;
      }
    },
    [
      open,
      highlightedIndex,
      totalItems,
      showCreateOption,
      filteredOptions,
      handleCreateNew,
      handleSelect,
      selectedOption,
    ],
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-option]");
      const item = items[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  return (
    <Popover open={effectiveOpen} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            id={id}
            name={name}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || loading}
            aria-label={ariaLabel}
            aria-expanded={effectiveOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            autoComplete="off"
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "md:text-sm",
              error && "border-destructive focus-visible:ring-destructive/20",
              (value || inputValue) && "pr-8",
              className,
            )}
          />
          {loading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && (value || inputValue) && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
              tabIndex={-1}
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div
          ref={listRef}
          role="listbox"
          className="max-h-[300px] overflow-y-auto p-1"
        >
          {filteredOptions.map((option, index) => (
            <div
              key={option.value}
              data-option
              role="option"
              aria-selected={value === option.value}
              aria-disabled={option.disabled}
              onClick={() => {
                if (!option.disabled) {
                  handleSelect(option.value, option.label);
                }
              }}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer",
                "hover:bg-accent hover:text-accent-foreground",
                highlightedIndex === index &&
                  "bg-accent text-accent-foreground",
                option.disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <Check
                className={cn(
                  "h-4 w-4 shrink-0",
                  value === option.value ? "opacity-100" : "opacity-0",
                )}
              />
              <div className="flex flex-col min-w-0">
                <span className="truncate">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-muted-foreground truncate">
                    {option.description}
                  </span>
                )}
              </div>
            </div>
          ))}
          {showCreateOption && (
            <>
              {filteredOptions.length > 0 && (
                <div className="h-px my-1 bg-border" />
              )}
              <div
                data-option
                role="option"
                onClick={handleCreateNew}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer",
                  "hover:bg-accent hover:text-accent-foreground",
                  highlightedIndex === filteredOptions.length &&
                    "bg-accent text-accent-foreground",
                )}
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>
                  {createLabel}: &quot;{inputValue}&quot;
                </span>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
