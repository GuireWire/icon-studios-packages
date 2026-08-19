"use client";

import { getCountryCallingCode, type Country } from "react-phone-number-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "./lib/utils";

// Same order used at every PhoneInput call site's `countries` prop, and the
// same order icon-pay's app/add-phone.tsx uses — kept here once so both
// props at each call site (`countries` and `countryOptionsOrder`) can stay
// in sync instead of duplicating the list a second time per site.
export const PHONE_COUNTRIES: Country[] = [
  "IE",
  "GB",
  "ES",
  "PL",
  "FR",
  "IT",
  "PT",
  "US",
  "CA",
  "BR",
];

const COUNTRY_NAMES: Partial<Record<Country, string>> = {
  IE: "Ireland",
  GB: "United Kingdom",
  ES: "Spain",
  PL: "Poland",
  FR: "France",
  IT: "Italy",
  PT: "Portugal",
  US: "United States",
  CA: "Canada",
  BR: "Brazil",
};

// Converts an ISO 3166-1 alpha-2 code (e.g. "IE") to its flag emoji by
// mapping each letter to the matching Unicode regional indicator symbol.
// Mirrors icon-pay's app/add-phone.tsx exactly, so the web and mobile phone
// inputs render flags the same way with no image asset dependency.
function countryCodeToFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

interface CountrySelectOption {
  value?: Country;
  label: string;
  divider?: boolean;
}

interface PhoneCountrySelectProps {
  value?: Country;
  onChange: (value: Country | undefined) => void;
  options: CountrySelectOption[];
  disabled?: boolean;
  className?: string;
}

// Replaces react-phone-number-input's default CountrySelect, which renders
// a bare, browser-styled <select> — inconsistent and visually rough across
// browsers/OSes. This swaps in a flag-emoji trigger + custom dropdown,
// matching the pattern icon-pay's mobile phone input already uses.
export function PhoneCountrySelect({
  value,
  onChange,
  options,
  disabled,
  className,
}: PhoneCountrySelectProps) {
  const countryOptions = options.filter(
    (option): option is { value: Country; label: string } =>
      !option.divider && !!option.value,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className={cn(
          "flex items-center gap-1 h-10 shrink-0 px-1 rounded-md disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
      >
        <span className="text-xl leading-none">
          {value ? countryCodeToFlagEmoji(value) : "🌐"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 max-h-64 overflow-y-auto no-scrollbar"
      >
        {countryOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              option.value === value && "bg-accent",
            )}
          >
            <span className="text-base leading-none">
              {countryCodeToFlagEmoji(option.value!)}
            </span>
            <span className="flex-1 truncate text-sm">
              {COUNTRY_NAMES[option.value!] ?? option.label}
            </span>
            <span className="text-xs text-muted-foreground">
              +{getCountryCallingCode(option.value!)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
