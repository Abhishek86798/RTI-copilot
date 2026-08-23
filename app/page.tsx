"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowRight, CalendarClock, CircleHelp, MapPinOff } from "lucide-react";

import {
  CounterQueue,
  JaaliBand,
  QuestionToRecords,
  RoutingFan,
  StatutoryClock,
} from "@/components/illustrations";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeader, Stat } from "@/components/section";
import { Button } from "@/components/ux4g/button";
import { DEMO_CASES } from "@/lib/client/demo-cases";
import { useI18n } from "@/lib/client/i18n";

const TOTAL_SECTIONS = 5;

/**
 * The landing page makes a five-part argument to someone who has already been
 * let down by a government website.
 *
 * It leads with the objection rather than the product — you should not need to
 * know which department to ask — and each section afterwards pairs one reason
 * the current experience fails with the specific thing this does instead. The
 * sections are numbered so a sceptical reader can see how long the case is
 * before committing to reading it.
 *
 * The visual register is deliberately split: government in its structure,
 * seriousness and sourcing; modern in its spacing and typography. It has to
 * read as official enough to trust with a pension number, and clean enough
 * that someone actually reaches the bottom.
 */
export default function HomePage() {
  const { t } = useI18n();
  const router = useRouter();

  const problems = [
    { icon: MapPinOff, titleKey: "home.problem.1.title", bodyKey: "home.problem.1.body" },
    { icon: CircleHelp, titleKey: "home.problem.2.title", bodyKey: "home.problem.2.body" },
    { icon: CalendarClock, titleKey: "home.problem.3.title", bodyKey: "home.problem.3.body" },
  ] as const;

  const stats = [
    { v: "home.stat.filed.value", l: "home.stat.filed.label", s: "home.stat.filed.source" },
    { v: "home.stat.pending.value", l: "home.stat.pending.label", s: "home.stat.pending.source" },
    { v: "home.stat.wait.value", l: "home.stat.wait.label", s: "home.stat.wait.source" },
    { v: "home.stat.defunct.value", l: "home.stat.defunct.label", s: "home.stat.defunct.source" },
  ] as const;

  const solutions = [
    "home.solution.1",
    "home.solution.2",
    "home.solution.3",
    "home.solution.4",
    "home.solution.5",
  ] as const;

  return (
    <>
      {/* ================================================================ */}
      {/* Hero                                                             */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden border-b border-border">
        {/* The jaali sits behind the type at low opacity — texture, not pattern. */}
        {/*
          Colour and opacity are set separately: `currentColor` inside an SVG
          <pattern> resolves against the <svg>'s own colour, and an opacity
          baked into the text colour left it rendering near-black when the
          utility did not generate. `w-full` matters too — without it the SVG
          sizes from its 6:1 intrinsic ratio and stops short of the viewport.
        */}
        <JaaliBand className="pointer-events-none absolute inset-x-0 top-0 h-44 w-full text-primary opacity-[0.07] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

        <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:py-32">
          <div>
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
                {t("home.hero.eyebrow")}
              </p>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="mt-7 text-[2.1rem] leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
                {t("home.hero.title")}
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-7 max-w-[46ch] text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {t("home.hero.body")}
              </p>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button size="xl" variant="cta" onClick={() => router.push("/apply")}>
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
              <p className="mt-5 max-w-[46ch] text-sm text-muted-foreground">
                {t("home.hero.note")}
              </p>
            </Reveal>
          </div>

          <Reveal delay={120} className="lg:justify-self-end">
            <CounterQueue className="w-full max-w-lg" />
          </Reveal>
        </div>

        {/* Anchor down to the argument, for anyone not ready to start yet. */}
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-10 sm:px-8 lg:px-12">
          <a
            href="#problem"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <ArrowDown aria-hidden="true" className="size-4" />
            {t("home.hero.scroll")}
          </a>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 01 — The problem                                                 */}
      {/* ================================================================ */}
      <Section id="problem" tone="alt">
        <SectionHeader
          index={1}
          total={TOTAL_SECTIONS}
          eyebrow={t("home.sec.problem.eyebrow")}
          title={t("home.sec.problem.title")}
          lead={t("home.sec.problem.lead")}
        />

        <ul className="grid gap-x-10 gap-y-12 md:grid-cols-3">
          {problems.map((problem, index) => (
            <Reveal as="li" key={problem.titleKey} delay={index * 90}>
              <span
                aria-hidden="true"
                className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"
              >
                <problem.icon className="size-6" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{t(problem.titleKey)}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {t(problem.bodyKey)}
              </p>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* ================================================================ */}
      {/* 02 — The scale                                                   */}
      {/* ================================================================ */}
      <Section tone="invert">
        <SectionHeader
          index={2}
          total={TOTAL_SECTIONS}
          eyebrow={t("home.sec.scale.eyebrow")}
          title={t("home.sec.scale.title")}
          lead={t("home.sec.scale.lead")}
          invert
        />

        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.v} delay={index * 80}>
              <Stat value={t(stat.v)} label={t(stat.l)} source={t(stat.s)} invert />
            </Reveal>
          ))}
        </div>

        <Reveal delay={320}>
          <p className="mt-14 max-w-[62ch] border-t border-primary-foreground/20 pt-6 text-sm text-primary-foreground/70">
            {t("home.stat.attrib")}
          </p>
        </Reveal>
      </Section>

      {/* ================================================================ */}
      {/* 03 — Routing                                                     */}
      {/* ================================================================ */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <SectionHeader
            index={3}
            total={TOTAL_SECTIONS}
            eyebrow={t("home.sec.routing.eyebrow")}
            title={t("home.sec.routing.title")}
            lead={t("home.sec.routing.lead")}
            className="mb-0"
          />
          <Reveal delay={100}>
            <RoutingFan className="w-full" />
          </Reveal>
        </div>
      </Section>

      {/* ================================================================ */}
      {/* 04 — The rewrite                                                 */}
      {/* ================================================================ */}
      <Section tone="alt">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <Reveal className="order-2 lg:order-1">
            <QuestionToRecords className="w-full" />
          </Reveal>
          <SectionHeader
            index={4}
            total={TOTAL_SECTIONS}
            eyebrow={t("home.sec.rewrite.eyebrow")}
            title={t("home.sec.rewrite.title")}
            lead={t("home.sec.rewrite.lead")}
            className="order-1 mb-0 lg:order-2"
          />
        </div>

        {/* The actual diff, because the pitch for this product is a diff. */}
        <Reveal delay={120}>
          <div className="mt-16 grid overflow-hidden rounded-2xl border border-border bg-background md:grid-cols-2">
            <div className="border-b border-border p-7 md:border-r md:border-b-0 lg:p-10">
              <p className="inline-flex rounded-full bg-card px-3 py-1 text-xs font-semibold tracking-[0.1em] text-destructive uppercase ring-1 ring-destructive/30">
                Usually refused
              </p>
              <blockquote className="mt-5 text-lg leading-relaxed text-muted-foreground italic">
                &ldquo;Why was my father&apos;s pension stopped without any
                notice? This is completely unfair and someone needs to explain
                what happened.&rdquo;
              </blockquote>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                An authority can lawfully decline this. It asks for an
                explanation, and the Act obliges them to hand over records, not
                to justify themselves.
              </p>
            </div>

            <div className="p-7 lg:p-10">
              <p className="inline-flex rounded-full bg-card px-3 py-1 text-xs font-semibold tracking-[0.1em] text-success uppercase ring-1 ring-success/30">
                Must be answered
              </p>
              <ol className="mt-5 space-y-3 text-base leading-relaxed">
                {[
                  "A certified copy of the order discontinuing pension against PPO No. MH/BAN/00123456.",
                  "All file notings relating to that discontinuation.",
                  "The name and designation of the officer who approved it.",
                ].map((item, index) => (
                  <li key={item} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 font-semibold text-muted-foreground tabular-nums"
                    >
                      {index + 1}.
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Same grievance. Now it asks for documents that exist on a file,
                so refusing it needs a stated exemption under Section 8.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ================================================================ */}
      {/* 05 — The clock                                                   */}
      {/* ================================================================ */}
      <Section>
        <SectionHeader
          index={5}
          total={TOTAL_SECTIONS}
          eyebrow={t("home.sec.clock.eyebrow")}
          title={t("home.sec.clock.title")}
          lead={t("home.sec.clock.lead")}
        />

        <Reveal>
          <StatutoryClock
            className="w-full max-w-3xl"
            labels={{
              filed: t("clock.filed"),
              deadline: t("clock.deadline"),
              appealCloses: t("clock.appealCloses"),
              alt: t("clock.alt"),
            }}
          />
        </Reveal>

        <Reveal delay={100}>
          <ol className="mt-16 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
            {solutions.map((key, index) => (
              <li key={key} className="border-t-2 border-primary/25 pt-5">
                <span
                  aria-hidden="true"
                  className="text-sm font-bold text-primary tabular-nums"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-base leading-relaxed">{t(key)}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </Section>

      {/* ================================================================ */}
      {/* Honesty + close                                                  */}
      {/* ================================================================ */}
      <Section tone="alt" className="border-t border-border">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeader
              eyebrow={t("home.sec.honest.eyebrow")}
              title={t("home.sec.honest.title")}
              lead={t("home.sec.honest.lead")}
              className="mb-0"
            />
            <Reveal delay={80}>
              <Link
                href="/how-it-works"
                className="mt-7 inline-flex items-center gap-2 text-base font-semibold text-primary underline-offset-4 hover:underline"
              >
                {t("home.sec.honest.cta")}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Reveal>
          </div>

          <Reveal delay={120} className="lg:justify-self-end lg:self-center">
            <div className="rounded-2xl border border-border bg-background p-8 lg:p-10">
              <h3 className="text-2xl font-bold tracking-tight text-balance">
                {t("home.cta.title")}
              </h3>
              <p className="mt-4 max-w-[40ch] text-base leading-relaxed text-muted-foreground">
                {t("home.cta.lead")}
              </p>
              <Button
                size="xl"
                variant="cta"
                className="mt-8 w-full sm:w-auto"
                onClick={() => router.push("/apply")}
              >
                {t("home.hero.start")}
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
