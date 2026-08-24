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
            className="min-h-52 text-base leading-relaxed"
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

        <p className="flex items-start gap-2 text-sm opacity-75">
          <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {t("intake.privacy")}
        </p>
      </form>

      <section aria-labelledby="demo-heading" className="mt-14">
        <Rule />
        <h2 id="demo-heading" className="sr-only">
          {t("intake.demoTitle")}
        </h2>
        <div className="pt-8">
          <Marker label={t("intake.demoTitle")} />
          <p className="mt-3 max-w-[52ch] text-sm leading-relaxed opacity-75">
            {t("intake.demoHelp")}
          </p>
        </div>

        {/*
          Hairline-divided cells rather than bordered cards, so the examples
          read as a footnote to the form above and not as three more decisions
          of equal weight to the one being asked.
        */}
        <ul className="mt-6 grid grid-cols-1 border-t border-border sm:grid-cols-3">
          {DEMO_CASES.map((demo) => (
            <li
              key={demo.id}
              className="border-b border-border sm:border-b-0 sm:border-l sm:first:border-l-0"
            >
              <button
                type="button"
                onClick={() => onPickDemo(demo)}
                disabled={loading}
                className={cn(
                  "h-full w-full cursor-pointer px-0 py-5 text-left transition-colors sm:px-6 sm:first:pl-0",
                  "hover:bg-card",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  "disabled:cursor-not-allowed disabled:opacity-60"
                )}
              >
                <span className="block text-sm font-semibold">{t(demo.labelKey)}</span>
                <span className="mt-1.5 block text-sm leading-relaxed opacity-75">
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
