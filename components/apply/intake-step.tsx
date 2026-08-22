"use client";

import { useId, useState } from "react";
import { ArrowRight, Loader2, Lock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, FieldHint, Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEMO_CASES, type DemoCase } from "@/lib/client/demo-cases";
import { useI18n } from "@/lib/client/i18n";
import { cn } from "@/lib/utils";

export const MIN_WORDS = 15;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Step 1. One textarea, and nothing else to decide.
 *
 * The official portal opens with three cascading dropdowns before you are
 * allowed to type a word; this opens with the only question the citizen can
 * actually answer. The demo cases below the box exist because a blank textarea
 * is genuinely intimidating to someone who has never written to a government
 * office and is not sure what they are allowed to ask for.
 */
export function IntakeStep({
  value,
  onChange,
  onSubmit,
  onPickDemo,
  loading,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onPickDemo: (demo: DemoCase) => void;
  loading: boolean;
}) {
  const { t } = useI18n();
  const fieldId = useId();
  const hintId = `${fieldId}-hint`;
  const countId = `${fieldId}-count`;
  const [touched, setTouched] = useState(false);

  const words = countWords(value);
  const tooShort = words < MIN_WORDS;
  const showError = touched && tooShort && words > 0;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (tooShort) return;
    onSubmit();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle as="h1" className="text-xl">{t("intake.title")}</CardTitle>
          <CardDescription className="text-base">{t("intake.help")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              {/* Visible label, not a placeholder. The placeholder disappears
                  the moment someone starts typing, which is when a first-time
                  filer most needs to know what the box wanted. */}
              <Label htmlFor={fieldId}>{t("intake.title")}</Label>
              <Textarea
                id={fieldId}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onBlur={() => setTouched(true)}
                placeholder={t("intake.placeholder")}
                rows={8}
                aria-describedby={`${hintId} ${countId}`}
                aria-invalid={showError || undefined}
                className="min-h-44 text-base leading-relaxed"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <FieldHint id={hintId} className="sr-only">
                  {t("intake.help")}
                </FieldHint>
                {/* Polite, so it does not interrupt on every keystroke. */}
                <p
                  id={countId}
                  aria-live="polite"
                  className={cn(
                    "text-sm tabular-nums",
                    tooShort ? "text-muted-foreground" : "text-success"
                  )}
                >
                  {words} {t("intake.words")}
                  {tooShort && ` / ${MIN_WORDS}`}
                </p>
              </div>
              {showError && <FieldError>{t("intake.minWords")}</FieldError>}
            </div>

            <Button
              type="submit"
              size="xl"
              variant="cta"
              disabled={loading || tooShort}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 aria-hidden="true" className="animate-spin" />
                  {t("intake.working")}
                </>
              ) : (
                <>
                  {t("intake.submit")}
                  <ArrowRight aria-hidden="true" />
                </>
              )}
            </Button>

            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {t("intake.privacy")}
            </p>
          </form>
        </CardContent>
      </Card>

      <section aria-labelledby="demo-heading">
        <h2
          id="demo-heading"
          className="flex items-center gap-2 text-base font-semibold"
        >
          <Sparkles aria-hidden="true" className="size-4 text-info" />
          {t("intake.demoTitle")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("intake.demoHelp")}</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {DEMO_CASES.map((demo) => (
            <li key={demo.id}>
              <button
                type="button"
                onClick={() => onPickDemo(demo)}
                disabled={loading}
                className={cn(
                  "h-full w-full cursor-pointer rounded-xl border border-border bg-card p-4 text-left transition-colors",
                  "hover:border-info hover:bg-accent",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  "disabled:cursor-not-allowed disabled:opacity-60"
                )}
              >
                <span className="block text-sm font-semibold">{t(demo.labelKey)}</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {t(demo.teachesKey)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
