"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { scrollPageToTop } from "@/components/smooth-scroll";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthorityStep } from "@/components/apply/authority-step";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { cn } from "@/lib/utils";
import { DraftStep } from "@/components/apply/draft-step";
import { IntakeStep } from "@/components/apply/intake-step";
import { ErrorNotice, FixtureNotice } from "@/components/notices";
import { StepIndicator } from "@/components/step-indicator";
import { generateDraft, routeAuthority, toApiError, type ApiError, type ResultSource } from "@/lib/client/api";
import { getDemoCase, type DemoCase } from "@/lib/client/demo-cases";
import { splitDraftItems } from "@/lib/client/filing";
import { createApplication, updateApplication, type Application } from "@/lib/client/store";
import { useApplication, useHydrated } from "@/lib/client/use-applications";
import type { RoutingResponse } from "@/lib/client/types";

type WizardStep = "intake" | "authority" | "draft";

const STEP_INDEX: Record<WizardStep, number> = {
  intake: 0,
  authority: 1,
  draft: 2,
};

/**
 * Steps 1–3 of the journey, held in component state.
 *
 * Routing and drafting are ephemeral until there is something worth keeping:
 * the application record is created the moment a draft comes back, and from
 * then on every edit is persisted. That split means a half-finished intake
 * never clutters the citizen's list, while a real draft survives a refresh, a
 * dropped connection, or a phone that killed the tab to save memory.
 *
 * Once the draft exists the journey moves to `/applications/[id]`, which owns
 * step 4 — filing needs a durable URL, and the record has to outlive the tab.
 */
function ApplyWizard({ resume }: { resume: Application | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const headingRef = useRef<HTMLDivElement>(null);

  /*
   * A deep link from the landing page (/apply?case=pension) seeds the box.
   * Computed as the initial state rather than applied by an effect: the query
   * string is already known on the first client render, so copying it into
   * state afterwards would only cause a second render and briefly show an
   * empty textarea.
   */
  const seeded = getDemoCase(searchParams.get("case") ?? "");

  const [step, setStep] = useState<WizardStep>(resume ? "draft" : "intake");
  const [grievance, setGrievance] = useState(
    () => resume?.grievance ?? seeded?.grievance ?? ""
  );
  const [isDemo, setIsDemo] = useState(() => resume?.isDemo ?? Boolean(seeded));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [source, setSource] = useState<ResultSource>("live");

  const [routing, setRouting] = useState<RoutingResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => resume?.authority.id ?? null
  );

  const [portalText, setPortalText] = useState(() => resume?.portalText ?? "");
  const [urgent, setUrgent] = useState(() => resume?.lifeOrLibertyFlag ?? false);
  const [urgentReason, setUrgentReason] = useState(
    () => resume?.lifeOrLibertyReason ?? ""
  );
  const [applicationId, setApplicationId] = useState<string | null>(
    () => resume?.id ?? null
  );

  /*
   * Move focus to the step heading on every step change. Without this a
   * keyboard or screen-reader user is left at the bottom of the previous
   * screen with no announcement that anything happened.
   */
  useEffect(() => {
    scrollPageToTop();
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const handleRoute = useCallback(
    async (text: string, demo: boolean) => {
      setError(null);
      setLoading(true);
      try {
        const result = await routeAuthority(text);
        setRouting(result.data);
        setSource(result.source);
        setSelectedId(result.data.candidates[0]?.authority.id ?? null);
        setIsDemo(demo);
        setStep("authority");
      } catch (caught) {
        setError(toApiError(caught));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  async function handleDraft() {
    if (!routing || !selectedId) return;
    const authority = routing.candidates.find(
      (c) => c.authority.id === selectedId
    )?.authority;
    if (!authority) return;

    setError(null);
    setLoading(true);
    try {
      const result = await generateDraft({
        grievance,
        authorityId: selectedId,
        extractedReferences: routing.extractedReferences,
      });

      setPortalText(result.data.portalText);
      setUrgent(result.data.lifeOrLibertyFlag);
      setUrgentReason(result.data.lifeOrLibertyReason);
      setSource((previous) =>
        previous === "demo-fixture" ? previous : result.source
      );

      /*
       * Coming back from step 4 to edit: the record already exists, so update
       * it rather than starting a second one. Redrafting used to leave the
       * citizen with two rows on their dashboard for one grievance.
       */
      if (applicationId) {
        updateApplication(applicationId, {
          authority,
          extractedReferences: routing.extractedReferences,
          items: result.data.items,
          fullText: result.data.fullText,
          portalText: result.data.portalText,
          lifeOrLibertyFlag: result.data.lifeOrLibertyFlag,
          lifeOrLibertyReason: result.data.lifeOrLibertyReason,
        });
      } else {
        const application = createApplication({
          grievance,
          authority,
          extractedReferences: routing.extractedReferences,
          items: result.data.items,
          fullText: result.data.fullText,
          portalText: result.data.portalText,
          lifeOrLibertyFlag: result.data.lifeOrLibertyFlag,
          lifeOrLibertyReason: result.data.lifeOrLibertyReason,
          isDemo,
        });
        setApplicationId(application.id);
      }
      setStep("draft");
    } catch (caught) {
      setError(toApiError(caught));
    } finally {
      setLoading(false);
    }
  }

  function handlePortalTextChange(value: string) {
    setPortalText(value);
    // items is what the printed application renders (FR-6), portalText is what
    // goes in the portal box (FR-4a). Saving only portalText meant an edit made
    // here showed on screen but never reached the PDF, which then carried
    // wording the citizen thought they had changed.
    if (applicationId) {
      updateApplication(applicationId, {
        portalText: value,
        items: splitDraftItems(value),
      });
    }
  }

  function handleToggleUrgency(next: boolean) {
    setUrgent(next);
    if (applicationId) {
      updateApplication(applicationId, { lifeOrLibertyFlag: next });
    }
  }

  function handlePickDemo(demo: DemoCase) {
    setGrievance(demo.grievance);
    void handleRoute(demo.grievance, true);
  }

  return (
    <div className={cn(PAGE_LAYOUT)}>
      <StepIndicator current={STEP_INDEX[step]} className="mb-8" />

      {/* Focus lands here on each step change; -1 keeps it out of tab order. */}
      <div ref={headingRef} tabIndex={-1} className="outline-none">
        {error && (
          <ErrorNotice
            error={error}
            onRetry={
              step === "intake"
                ? () => void handleRoute(grievance, isDemo)
                : () => void handleDraft()
            }
            className="mb-6"
          />
        )}

        {source === "demo-fixture" && step !== "intake" && (
          <FixtureNotice className="mb-6" />
        )}

        {step === "intake" && (
          <IntakeStep
            value={grievance}
            onChange={(value) => {
              setGrievance(value);
              // Typing over a seeded case makes it the citizen's own text, and
              // the fixture fallback must not answer for it.
              setIsDemo(false);
            }}
            onSubmit={() => void handleRoute(grievance, isDemo)}
            onPickDemo={handlePickDemo}
            loading={loading}
          />
        )}

        {step === "authority" && routing && (
          <AuthorityStep
            routing={routing}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onBack={() => setStep("intake")}
            onSubmit={() => void handleDraft()}
            loading={loading}
          />
        )}

        {step === "draft" && (
          <DraftStep
            grievance={grievance}
            portalText={portalText}
            onPortalTextChange={handlePortalTextChange}
            lifeOrLibertyFlag={urgent}
            lifeOrLibertyReason={urgentReason}
            onToggleUrgency={handleToggleUrgency}
            /*
             * Resuming from step 4 restores the draft but not the shortlist
             * that produced it — candidates are a server answer, not part of
             * the saved application. Rather than reconstruct a one-entry list
             * that would misrepresent what the router actually returned, ask
             * it again.
             */
            onBack={() =>
              routing ? setStep("authority") : void handleRoute(grievance, isDemo)
            }
            backLoading={loading && !routing}
            onSubmit={() => {
              if (applicationId) router.push(`/applications/${applicationId}`);
            }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Resolves `?draft=<id>` before the wizard mounts.
 *
 * Step 4 lives on its own route, so "back to the previous step" has to come
 * back here and land on the draft rather than at the start of the form. The
 * lookup happens out here, and the id is used as a `key`, so the wizard's
 * initial state can be read straight from the record — no effect that seeds
 * state on a second render, and no flash of an empty step 1.
 */
function ApplyRoute() {
  const searchParams = useSearchParams();
  const hydrated = useHydrated();
  const resumeId = searchParams.get("draft");
  const resumed = useApplication(resumeId ?? "");

  if (resumeId && !hydrated) {
    return <Loading />;
  }

  return <ApplyWizard key={resumeId ?? "new"} resume={resumed ?? null} />;
}

function Loading() {
  return (
    <div className={cn(PAGE_LAYOUT)}>
      <p className="text-muted-foreground">Loading…</p>
    </div>
  );
}

/**
 * `useSearchParams` opts the subtree into client-side rendering, so Next needs
 * a boundary to prerender the shell around it.
 */
export default function ApplyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ApplyRoute />
    </Suspense>
  );
}
