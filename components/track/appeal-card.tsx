"use client";

import { useState } from "react";
import { Gavel, Printer } from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ux4g/button";
import { Marker, Rule } from "@/components/editorial";
import { Input } from "@/components/ui/input";
import { FieldHint, Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toDateInputValue } from "@/lib/client/deadlines";
import type { AppealDraft } from "@/lib/client/guest-storage";
import { useI18n } from "@/lib/client/i18n";

/**
 * The First Appeal, drafted the moment the response deadline lapses.
 *
 * This is the step almost nobody takes, because almost nobody is told it
 * exists. Silence past the statutory period is a deemed refusal under Section
 * 7(2), a First Appeal under Section 19(1) costs nothing, and the window is
 * only thirty days — so the appeal is written and waiting rather than offered
 * as something to go and figure out.
 */
export function AppealCard({
  appealText,
  onAppealTextChange,
  appeal,
  onMarkAppealFiled,
  onPrint,
}: {
  appealText: string;
  onAppealTextChange: (value: string) => void;
  appeal?: AppealDraft;
  onMarkAppealFiled: (details: { filedAt: string; registrationNumber: string }) => void;
  onPrint: () => void;
}) {
  const { t } = useI18n();
  const [filedAt, setFiledAt] = useState(toDateInputValue());
  const [registrationNumber, setRegistrationNumber] = useState("");

  const alreadyFiled = Boolean(appeal?.filedAt);

  return (
    <section aria-labelledby="appeal-heading">
      <Rule />

      <div className="pt-8">
        <Marker label={t("track.appealTitle")} dim={false} className="text-warning" />
        <h2
          id="appeal-heading"
          className="mt-5 flex items-start gap-3 text-[1.75rem] leading-[1.12] font-bold tracking-[-0.02em] text-balance sm:text-[2.25rem]"
        >
          <Gavel aria-hidden="true" className="mt-1.5 size-7 shrink-0 text-warning" />
          {t("track.appealTitle")}
        </h2>
        <p className="mt-4 max-w-[58ch] leading-relaxed opacity-75">
          {t("track.appealHelp")}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="appeal-text">{t("track.appealTitle")}</Label>
          <Textarea
            id="appeal-text"
            value={appealText}
            onChange={(event) => onAppealTextChange(event.target.value)}
            rows={18}
            className="min-h-96 font-mono text-sm leading-relaxed"
          />
          <FieldHint>
            Fill in anything shown in square brackets before you file. Editing
            here does not change your original application.
          </FieldHint>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <CopyButton value={appealText} variant="cta" />
          <Button type="button" size="xl" variant="outline" onClick={onPrint}>
            <Printer aria-hidden="true" />
            {t("common.print")}
          </Button>
        </div>

        {alreadyFiled ? (
          <p className="border-l-2 border-success py-1 pl-4 text-sm font-medium text-success">
            Appeal recorded as filed on {appeal?.filedAt}
            {appeal?.registrationNumber ? ` (${appeal.registrationNumber})` : ""}.
          </p>
        ) : (
          <form
            className="space-y-4 border-t border-border pt-6"
            onSubmit={(event) => {
              event.preventDefault();
              onMarkAppealFiled({ filedAt, registrationNumber });
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="appeal-filed-at">{t("file.filedDate")}</Label>
                <Input
                  id="appeal-filed-at"
                  type="date"
                  required
                  value={filedAt}
                  max={toDateInputValue()}
                  onChange={(event) => setFiledAt(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="appeal-reg">
                  {t("file.regNumber")}{" "}
                  <span className="font-normal opacity-75">
                    ({t("common.optional")})
                  </span>
                </Label>
                <Input
                  id="appeal-reg"
                  value={registrationNumber}
                  onChange={(event) => setRegistrationNumber(event.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            <Button type="submit" size="xl">
              {t("track.markAppealed")}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
