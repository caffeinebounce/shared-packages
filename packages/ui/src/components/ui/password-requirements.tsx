"use client";

import { CheckCircle2Icon, InfoIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "../../utils";

export interface PasswordRule {
  id: string;
  label: string;
  validator: (password: string) => boolean;
}

export const defaultPasswordRules: PasswordRule[] = [
  {
    id: "min-length",
    label: "Must be at least 8 characters long",
    validator: (password) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "Must contain an uppercase letter",
    validator: (password) => /[A-Z]/.test(password),
  },
  {
    id: "special",
    label: "Must contain a special character",
    validator: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

export const extendedPasswordRules: PasswordRule[] = [...defaultPasswordRules];

interface PasswordRequirementsProps extends React.ComponentProps<"ul"> {
  password: string;
  rules?: PasswordRule[];
}

function PasswordRequirements({
  password,
  rules = defaultPasswordRules,
  className,
  ...props
}: PasswordRequirementsProps) {
  return (
    <ul className={cn("flex flex-col gap-1.5 text-xs", className)} {...props}>
      {rules.map((rule) => {
        const isMet = password.length > 0 && rule.validator(password);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-1.5 transition-colors duration-200",
              isMet ? "text-green-600" : "text-muted-foreground",
            )}
          >
            {isMet ? (
              <CheckCircle2Icon className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <InfoIcon className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

export { PasswordRequirements };
