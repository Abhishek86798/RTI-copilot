"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CircleHelp,
  MapPinOff,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DEMO_CASES } from "@/lib/client/demo-cases";
import { useI18n } from "@/lib/client/i18n";

/**
 * The landing page has one job: convince someone who has already been let down
 * by a government website that this one is worth thirty more seconds.
 *
 * So it leads with the objection rather than the product — you should not need
 * to know which department to ask — and shows the actual before/after rewrite
 * above the fold on desktop. The pitch for this product is a diff, and no
 * amount of describing it beats showing it.
 */
export default function HomePage() {
  const { t } = useI18n();
  const router = useRouter();

  const problems = [
    { icon: MapPinOff, titleKey: "home.problem.1.title", bodyKey: "home.problem.1.body" },
    { icon: CircleHelp, titleKey: "home.problem.2.title", bodyKey: "home.problem.2.body" },
    { icon: CalendarClock, titleKey: "home.problem.3.title", bodyKey: "home.problem.3.body" },
  ] as const;

  const solutions = [
    "home.solution.1",
    "home.solution.2",
    "home.solution.3",
    "home.solution.4",
    "home.solution.5",
  ] as const;

  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-12 sm:py-20">
        <div className="prose-measure">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
            <ShieldCheck aria-hidden="true" className="size-4" />
            Right to Information Act, 2005
          </p>
          <h1 className="text-3xl leading-[1.15] font-bold tracking-tight text-balance sm:text-5xl">
            {t("home.hero.title")}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
            {t("home.hero.body")}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            size="xl"
            variant="cta"
            onClick={() => router.push("/apply")}
            className="sm:w-auto"
          >
            {t("home.hero.start")}
            <ArrowRight aria-hidden="true" />
          </Button>
          <Button
            size="xl"
            variant="outline"
            onClick={() => router.push(`/apply?case=${DEMO_CASES[0].id}`)}
          >
            {t("home.hero.demo")}
          </Button>
        </div>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          {t("home.hero.note")}
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The rewrite, shown rather than described                          */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="rewrite-heading" className="pb-14">
        <h2 id="rewrite-heading" className="sr-only">
          An example of the rewrite
        </h2>
        <Card className="overflow-hidden ring-1 ring-foreground/10">
          <div className="grid md:grid-cols-2">
            <div className="border-b border-border p-6 md:border-r md:border-b-0">
              <p className="mb-3 inline-flex rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-destructive uppercase">
                Usually refused
              </p>
              <blockquote className="text-base leading-relaxed text-muted-foreground italic">
                “Why was my father&apos;s pension stopped without any notice?
                This is completely unfair and someone needs to explain what
                happened.”
              </blockquote>
              <p className="mt-4 text-sm text-muted-foreground">
                An authority can lawfully decline this. It asks for an
                explanation, and the Act obliges them to hand over records, not
                to justify themselves.
              </p>
            </div>
            <div className="p-6">
              <p className="mb-3 inline-flex rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold tracking-wide text-success uppercase">
                Must be answered
              </p>
              <ol className="space-y-2 text-base leading-relaxed">
                <li className="flex gap-2">
                  <span aria-hidden="true" className="font-semibold text-muted-foreground">
                    1.
                  </span>
                  <span>
                    A certified copy of the order discontinuing pension against
                    PPO No. MH/BAN/00123456.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden="true" className="font-semibold text-muted-foreground">
                    2.
                  </span>
                  <span>
                    All file notings relating to that discontinuation.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden="true" className="font-semibold text-muted-foreground">
                    3.
                  </span>
                  <span>
                    The name and designation of the officer who approved it.
                  </span>
                </li>
              </ol>
              <p className="mt-4 text-sm text-muted-foreground">
                Same grievance. Now it asks for documents that exist on a file,
                so refusing it needs a stated exemption under Section 8.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Why applications fail                                             */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="problem-heading" className="border-t border-border py-14">
        <h2
          id="problem-heading"
          className="text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {t("home.problem.title")}
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {problems.map((problem) => (
            <div key={problem.titleKey}>
              <problem.icon
                aria-hidden="true"
                className="size-6 text-info"
                strokeWidth={1.75}
              />
              <h3 className="mt-3 text-base font-semibold">{t(problem.titleKey)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(problem.bodyKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* What we do                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="solution-heading" className="border-t border-border py-14">
        <h2
          id="solution-heading"
          className="text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {t("home.solution.title")}
        </h2>
        <ol className="mt-8 space-y-5">
          {solutions.map((key, index) => (
            <li key={key} className="flex gap-4">
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
              >
                {index + 1}
              </span>
              <p className="prose-measure pt-1 text-base leading-relaxed">{t(key)}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button size="xl" variant="cta" onClick={() => router.push("/apply")}>
            {t("home.hero.start")}
            <ArrowRight aria-hidden="true" />
          </Button>
          <Link
            href="/how-it-works"
            className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4 hover:text-foreground"
          >
            {t("disclosure.title")}
          </Link>
        </div>
      </section>
    </div>
  );
}
