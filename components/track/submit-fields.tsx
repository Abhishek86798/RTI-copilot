"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * The radio groups the real Submit Request form uses.
 *
 * It renders Gender, Country, Status and Educational Status as inline radios
 * rather than dropdowns, and that is the better control for two or three
 * options anyway: every choice is visible without opening anything, and each
 * is a 44px target instead of one collapsed select.
 *
 * A real `fieldset`/`legend` rather than a div and a label — it is what makes
 * a screen reader announce "Gender, Male, 1 of 3" instead of reading three
 * unrelated radios and leaving the question behind.
 */
export function RadioField<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
  hint,
  className,
}: {
  legend: string;
  name: string;
  value: T | undefined;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  hint?: string;
  className?: string;
}) {
  return (
    <fieldset className={cn("space-y-1", className)}>
      <legend className="mb-1.5 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex min-h-9 cursor-pointer items-center gap-2 text-sm"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="size-4 shrink-0 cursor-pointer accent-[var(--primary)]"
            />
            {option.label}
          </label>
        ))}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </fieldset>
  );
}

/** A native select, styled to match the inputs beside it. */
export function SelectField({
  id,
  label,
  value,
  onChange,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={id} required>
        {label}
      </Label>
      <Select
        id={id}
        value={value}
        aria-required="true"
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </Select>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
