"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";

import {
  Band,
  Display,
  Frame,
  Marker,
  Reveal,
  Rule,
  RuleGrid,
  Stat,
} from "@/components/editorial";
import { Drawn } from "@/components/drawn";
import { QuestionToRecords, RoutingFan, StatutoryClock } from "@/components/illustrations";
import { Button } from "@/components/ux4g/button";
import { DEMO_CASES } from "@/lib/client/demo-cases";
import { useI18n } from "@/lib/client/i18n";

const TOTAL = 5;

/**
 * The landing page, as a five-part editorial argument.
 *
 * Structure is Swiss on purpose. Hairline rules instead of cards, numerals at
 * display size, small tracked section markers, and photography that is
 * documentary rather than decorative. It has to read as serious enough to
 * trust with a pension number and clean enough that a sceptic reaches the
 * bottom — a government service that looks like a marketing page achieves
 * neither.
 *
 * Diagrams rather than photography. Line art in a single stroke weight stays
 * quiet next to type this large, carries no licensing question, weighs a few
 * kilobytes on a connection that cannot spare hundreds, and never implies that
 * some photographed stranger is an RTI applicant.
 */
export default function HomePage() {
  const { t } = useI18n();
  const router = useRouter();

  const problems = [
    { titleKey: "home.problem.1.title", bodyKey: "home.problem.1.body" },
    { titleKey: "home.problem.2.title", bodyKey: "home.problem.2.body" },
    { titleKey: "home.problem.3.title", bodyKey: "home.problem.3.body" },
  ] as const;

  const stats = [
    ["home.stat.filed.value", "home.stat.filed.label", "home.stat.filed.source"],
    ["home.stat.pending.value", "home.stat.pending.label", "home.stat.pending.source"],
    ["home.stat.wait.value", "home.stat.wait.label", "home.stat.wait.source"],
    ["home.stat.defunct.value", "home.stat.defunct.label", "home.stat.defunct.source"],
  ] as const;

  const solutions = [
    "home.solution.1",
    "home.solution.2",
    "home.solution.3",
    "home.solution.4",
    "home.solution.5",
  ] as const;

  const domains = [
    "Pension", "Provident fund", "Land records", "Police / FIR",
    "Ration & PDS", "Passport", "Electricity", "Municipal",
    "Water", "Income tax", "Transport", "Health",
  ];

  return (
    <>
      {/* ================================================================= */}
      {/* Hero                                                              */}
      {/* ================================================================= */}
      <Band frame={false}>
        <Frame>
          <div className="border-b border-border py-3">
            <Marker label={t("home.hero.eyebrow")} />
          </div>

          <div className="grid gap-10 py-10 lg:grid-cols-[1.55fr_1fr] lg:items-end lg:gap-16 lg:py-14">
            <Reveal>
              <Display
                as="h1"
                className="max-w-[17ch] text-[2.35rem] sm:text-[3.2rem] lg:text-[4.15rem]"
              >
                {t("home.hero.title")}
              </Display>
            </Reveal>

            {/* Stat pair divided by a hairline, as in the reference layouts. */}
            <Reveal delay={80}>
              <div className="grid grid-cols-2 border-t border-border pt-6 lg:border-t-0 lg:pt-0">
                <div className="pr-6">
                  <p className="text-[2.5rem] leading-none font-bold tracking-[-0.03em] tabular-nums sm:text-[3.25rem]">
                    30
                  </p>
                  <p className="mt-3 font-mono text-[0.68rem] tracking-[0.16em] uppercase opacity-75">
                    Days to reply
                  </p>
                </div>
                <div className="border-l border-border pl-6">
                  <p className="text-[2.5rem] leading-none font-bold tracking-[-0.03em] tabular-nums sm:text-[3.25rem]">
                    ₹10
                  </p>
                  <p className="mt-3 font-mono text-[0.68rem] tracking-[0.16em] uppercase opacity-75">
                    Fee, or free if BPL
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <Rule />

          <div className="grid gap-10 py-12 lg:grid-cols-[1.55fr_1fr] lg:gap-16">
            <Reveal>
              <p className="max-w-[70ch] text-lg leading-relaxed opacity-80 sm:text-xl">
                {t("home.hero.body")}
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button size="xl" variant="cta" onClick={() => router.push("/apply")}>
                  {t("home.hero.start")}
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  onClick={() => router.push(`/apply?case=${DEMO_CASES[0].id}`)}
                >
                  {t("home.hero.demo")}
                </Button>
              </div>

              <p className="mt-5 max-w-[46ch] text-sm opacity-75">{t("home.hero.note")}</p>
            </Reveal>

            <Reveal delay={80} className="lg:border-l lg:border-border lg:pl-16">
              <p className="text-base font-medium">{t("home.hero.covers")}</p>
              <ul className="mt-5 grid grid-cols-2 gap-x-6 border-t border-border">
                {domains.map((d) => (
                  <li
                    key={d}
                    className="border-b border-border py-2 font-mono text-[0.72rem] tracking-wide uppercase opacity-75"
                  >
                    {d}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs opacity-72">{t("home.hero.coversNote")}</p>
            </Reveal>
          </div>
        </Frame>
      </Band>


      {/* ================================================================= */}
      {/* 01 — The problem                                                  */}
      {/* ================================================================= */}
      <Band id="problem" tone="alt">
        <Frame className="py-16 lg:py-24">
          <Reveal>
            <Marker index={1} total={TOTAL} label={t("home.sec.problem.eyebrow")} />
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
              <Display>{t("home.sec.problem.title")}</Display>
              <p className="max-w-[54ch] self-end text-base leading-relaxed opacity-75">
                {t("home.sec.problem.lead")}
              </p>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <RuleGrid cols={3} className="mt-14 border-t border-border">
              {problems.map((p, i) => (
                <div key={p.titleKey}>
                  <span className="font-mono text-[0.68rem] tracking-[0.16em] opacity-72">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-lg leading-snug font-semibold">
                    {t(p.titleKey)}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed opacity-75">{t(p.bodyKey)}</p>
                </div>
              ))}
            </RuleGrid>
          </Reveal>
        </Frame>
      </Band>

      {/* ================================================================= */}
      {/* 02 — The scale                                                    */}
      {/* ================================================================= */}
      <Band tone="invert">
        <Frame className="py-16 lg:py-24">
          <Reveal>
            <Marker index={2} total={TOTAL} label={t("home.sec.scale.eyebrow")} />
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
              <Display>{t("home.sec.scale.title")}</Display>
              <p className="max-w-[54ch] self-end text-base leading-relaxed opacity-75">
                {t("home.sec.scale.lead")}
              </p>
            </div>
          </Reveal>

          <Reveal delay={60}>
            {/* Hairlines inherit the band's inverted colour so they stay visible. */}
            <RuleGrid
              cols={4}
              className="mt-14 border-t border-current/25 [&>*]:border-current/25"
            >
              {stats.map(([v, l, s]) => (
                <Stat key={v} value={t(v)} label={t(l)} source={t(s)} />
              ))}
            </RuleGrid>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-10 max-w-[64ch] border-t border-current/25 pt-6 text-xs leading-relaxed opacity-75">
              {t("home.stat.attrib")}
            </p>
          </Reveal>
        </Frame>
      </Band>

      {/* ================================================================= */}
      {/* 03 — Routing                                                      */}
      {/* ================================================================= */}
      <Band>
        <Frame className="py-16 lg:py-24">
          <Reveal>
            <Marker index={3} total={TOTAL} label={t("home.sec.routing.eyebrow")} />
          </Reveal>

          <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <Reveal>
              <Display>{t("home.sec.routing.title")}</Display>
              <p className="mt-7 max-w-[50ch] text-base leading-relaxed opacity-75">
                {t("home.sec.routing.lead")}
              </p>
            </Reveal>

            <Reveal delay={80} className="lg:border-l lg:border-border lg:pl-16">
              <Drawn>
                <RoutingFan className="w-full" />
              </Drawn>
            </Reveal>
          </div>
        </Frame>
      </Band>

      {/* ================================================================= */}
      {/* 04 — The rewrite                                                  */}
      {/* ================================================================= */}
      <Band tone="alt">
        <Frame className="py-16 lg:py-24">
          <Reveal>
            <Marker index={4} total={TOTAL} label={t("home.sec.rewrite.eyebrow")} />
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
              <Display>{t("home.sec.rewrite.title")}</Display>
              <p className="max-w-[54ch] self-end text-base leading-relaxed opacity-75">
                {t("home.sec.rewrite.lead")}
              </p>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <Drawn className="mt-14">
              <QuestionToRecords className="mx-auto w-full max-w-xl" />
            </Drawn>
          </Reveal>

          {/* The diff, because the pitch for this product is a diff. */}
          <Reveal delay={80}>
            <div className="mt-14 grid border-t border-border md:grid-cols-2">
              <div className="border-b border-border py-9 md:border-r md:border-b-0 md:pr-12">
                <Marker label="Usually refused" className="text-destructive" dim={false} />
                <blockquote className="mt-6 max-w-[42ch] text-xl leading-snug">
                  &ldquo;Why was my father&apos;s pension stopped without any
                  notice? This is completely unfair and someone needs to explain
                  what happened.&rdquo;
                </blockquote>
                <p className="mt-6 max-w-[46ch] text-sm leading-relaxed opacity-75">
                  An authority can lawfully decline this. It asks for an
                  explanation, and the Act obliges them to hand over records, not
                  to justify themselves.
                </p>
              </div>

              <div className="py-9 md:pl-12">
                <Marker label="Must be answered" className="text-success" dim={false} />
                <ol className="mt-6 border-t border-border">
                  {[
                    "A certified copy of the order discontinuing pension against PPO No. MH/BAN/00123456.",
                    "All file notings relating to that discontinuation.",
                    "The name and designation of the officer who approved it.",
                  ].map((item, i) => (
                    <li
                      key={item}
                      className="flex gap-5 border-b border-border py-4 text-base leading-relaxed"
                    >
                      <span
                        aria-hidden="true"
                        className="font-mono text-xs opacity-72 tabular-nums"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="max-w-[44ch]">{item}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 max-w-[46ch] text-sm leading-relaxed opacity-75">
                  Same grievance. Now it asks for documents that exist on a file,
                  so refusing it needs a stated exemption under Section 8.
                </p>
              </div>
            </div>
          </Reveal>
        </Frame>
      </Band>

      {/* ================================================================= */}
      {/* 05 — The clock                                                    */}
      {/* ================================================================= */}
      <Band>
        <Frame className="py-16 lg:py-24">
          <Reveal>
            <Marker index={5} total={TOTAL} label={t("home.sec.clock.eyebrow")} />
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
              <Display>{t("home.sec.clock.title")}</Display>
              <p className="max-w-[54ch] self-end text-base leading-relaxed opacity-75">
                {t("home.sec.clock.lead")}
              </p>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <Drawn className="mt-14">
              <StatutoryClock
                className="mx-auto w-full max-w-5xl"
                labels={{
                  filed: t("clock.filed"),
                  deadline: t("clock.deadline"),
                  appealCloses: t("clock.appealCloses"),
                  alt: t("clock.alt"),
                }}
              />
            </Drawn>
          </Reveal>

          <Reveal delay={80}>
            <RuleGrid cols={4} className="mt-16 border-t border-border">
              {solutions.map((key, i) => (
                <div key={key}>
                  <span className="font-mono text-[0.68rem] tracking-[0.16em] opacity-72">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-4 text-sm leading-relaxed">{t(key)}</p>
                </div>
              ))}
            </RuleGrid>
          </Reveal>
        </Frame>
      </Band>

      {/* ================================================================= */}
      {/* Honesty and close                                                 */}
      {/* ================================================================= */}
      <Band tone="alt">
        <Frame className="py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <Reveal>
              <Marker label={t("home.sec.honest.eyebrow")} />
              <Display className="mt-8">{t("home.sec.honest.title")}</Display>
              <p className="mt-7 max-w-[52ch] text-base leading-relaxed opacity-75">
                {t("home.sec.honest.lead")}
              </p>
              <Link
                href="/how-it-works"
                className="mt-8 inline-flex min-h-12 items-center gap-2 border-b border-current pb-1 text-base font-medium"
              >
                {t("home.sec.honest.cta")}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Reveal>

            <Reveal delay={80} className="lg:border-l lg:border-border lg:pl-16">
              <h3 className="max-w-[16ch] text-2xl leading-tight font-bold tracking-tight text-balance sm:text-3xl">
                {t("home.cta.title")}
              </h3>
              <p className="mt-5 max-w-[42ch] text-base leading-relaxed opacity-75">
                {t("home.cta.lead")}
              </p>
              <Button
                size="xl"
                variant="cta"
                className="mt-9 w-full sm:w-auto"
                onClick={() => router.push("/apply")}
              >
                {t("home.hero.start")}
                <ArrowRight aria-hidden="true" />
              </Button>
            </Reveal>
          </div>
        </Frame>
      </Band>
    </>
  );
}
