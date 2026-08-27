"use client";

import { useId, useState } from "react";
import { ArrowRight, Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ux4g/button";
import { Marker, PageTitle, Rule } from "@/components/editorial";
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
 *
 * The question is set as the page title rather than a card heading. There is
 * one thing to do on this screen, so nothing here should look like a panel
 * competing with something else.
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
    <div>
      <PageTitle
        marker={<Marker index={1} total={5} label={t("steps.describe")} />}
        lead={t("intake.help")}
      >
        {t("intake.title")}
      </PageTitle>

      {/*
        Full measure, matching the step rule above it on both edges. Capping
        it left the block short on the right and reading as left-shifted
        inside its own frame.
      */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <div className="space-y-2">
          {/*
            The page title directly above already reads "What happened?", so a
            second visible copy was pure repetition. It stays in the
            accessibility tree so the field keeps its programmatic label.
          */}
          <Label htmlFor={fieldId} className="sr-only">
            {t("intake.title")}
          </Label>
          <Textarea
            id={fieldId}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={t("intake.placeholder")}
            rows={8}
            aria-describedby={`${hintId} ${countId}`}
            aria-invalid={showError || undefined}
            className="min-h-52 text-base leading-relaxed border-border bg-background shadow-sm"
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
                "ml-auto font-mono text-[0.68rem] tracking-[0.14em] uppercase tabular-nums",
                tooShort ? "opacity-75" : "text-success"
              )}
            >
              {tooShort
                ? `${words} / ${MIN_WORDS} ${t("intake.wordsMin")}`
                : `${words} ${t("intake.words")}`}
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
      </form>
    </div>
  );
}
