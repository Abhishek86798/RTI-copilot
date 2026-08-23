/**
 * Hand-authored SVG illustrations.
 *
 * Drawn rather than photographed, for four reasons that all matter for this
 * particular product. The whole set weighs a few kilobytes against the
 * hundreds a photographic hero would cost, on a site built for district-town
 * 3G. They stay sharp on any screen. They carry no licensing question. And
 * they can depict a citizen at a government counter without using a
 * photograph of a real person as though they were a real RTI applicant.
 *
 * The visual language is Indian architecture rather than national symbols:
 * jaali lattice, jharokha arches, a chhatri finial. Deliberately no State
 * Emblem, no Ashoka Chakra, no tricolour — this is an independent tool, and
 * borrowing the iconography of the state would imply an endorsement that does
 * not exist. The arches read as unmistakably Indian without claiming anything.
 *
 * Everything is drawn in `currentColor` and the theme tokens, so a single
 * `text-*` class on the parent restyles a whole illustration and dark mode
 * needs no second copy.
 */

/**
 * A person, in the least amount of geometry that still reads as a person.
 *
 * Sloped shoulders rather than a semicircle: a half-disc under a dot reads as
 * a blob, and the shoulder line is the single cue that makes a silhouette
 * legible as human at this size.
 */
function Figure({
  x,
  y,
  scale = 1,
  opacity = 1,
}: {
  x: number;
  y: number;
  /** 1 is roughly 96px tall. */
  scale?: number;
  opacity?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <circle cx="0" cy="-58" r="15" fill="currentColor" />
      <path
        d="M-25 0v-24c0-11 7-19 16-22h18c9 3 16 11 16 22V0Z"
        fill="currentColor"
      />
    </g>
  );
}

/** The pierced-stone lattice. Fine and low-contrast: texture, not wallpaper. */
function JaaliDefs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width="18" height="18" patternUnits="userSpaceOnUse">
        {/*
          Interlocking circles on a half-drop grid — the classic jaali read.
          An earlier version added a cross through each circle, which at small
          sizes turned the whole field into a mesh of X's.
        */}
        <circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="0" cy="0" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="18" cy="0" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="0" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="18" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
      </pattern>
    </defs>
  );
}

/**
 * The queue at the counter — the scene this whole product exists to shorten.
 *
 * A clerk behind a grilled jharokha window, the stack of files that is the
 * actual holder of the record, and two citizens on the public side. The one at
 * the front is holding a sheet of paper: the application that is about to be
 * refused for asking the wrong question of the wrong office.
 */
export function CounterQueue({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 330"
      fill="none"
      role="img"
      aria-label="A citizen holding an application at a government counter, with a clerk behind a grilled window and a stack of files beside them."
      className={className}
    >
      <JaaliDefs id="jaali-counter" />

      {/* Back wall */}
      <rect x="0" y="0" width="480" height="228" rx="10" className="text-primary/5" fill="currentColor" />

      {/* Jharokha window: arch, lattice infill, grille bars */}
      <g>
        <path
          d="M168 210V116a72 72 0 0 1 144 0v94Z"
          className="text-primary/25"
          fill="url(#jaali-counter)"
        />
        <path
          d="M168 210V116a72 72 0 0 1 144 0v94"
          className="text-primary/50"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Vertical grille — the bit you actually talk through */}
        <g className="text-primary/30">
          {[204, 240, 276].map((gx) => (
            <path key={gx} d={`M${gx} 210V${gx === 240 ? 78 : 92}`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          ))}
        </g>
        {/* Chhatri finial */}
        <path
          d="M240 44v-12M226 32h28l-7 12h-14z"
          className="text-primary/45"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>

      {/* Clerk, behind the grille */}
      <g className="text-primary/55">
        <Figure x={240} y={210} scale={0.9} />
      </g>

      {/* Counter slab and front panel */}
      <rect x="24" y="210" width="432" height="16" rx="4" className="text-primary/30" fill="currentColor" />
      <rect x="40" y="226" width="400" height="62" className="text-primary/9" fill="currentColor" />

      {/* The files: where the record actually lives */}
      <g className="text-warning">
        <rect x="346" y="186" width="76" height="11" rx="2.5" fill="currentColor" opacity="0.9" />
        <rect x="340" y="197" width="88" height="11" rx="2.5" fill="currentColor" opacity="0.65" />
        <rect x="352" y="175" width="64" height="11" rx="2.5" fill="currentColor" opacity="0.45" />
      </g>

      {/* Citizen at the front */}
      <g className="text-foreground/85">
        <Figure x={96} y={288} scale={1.05} />
      </g>
      {/* The application in their hand */}
      <g className="text-info">
        <rect x="126" y="234" width="34" height="44" rx="3" fill="currentColor" />
        <path
          d="M134 246h18M134 254h18M134 262h11"
          stroke="var(--info-foreground)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>

      {/* Citizen waiting behind, smaller for depth */}
      <g className="text-foreground/40">
        <Figure x={40} y={288} scale={0.82} />
      </g>

      {/* Floor */}
      <path d="M8 288h464" className="text-border" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Routing: one plain-language grievance, several possible offices, one match.
 *
 * The greyed, dotted branches are the Section 6(3) risk drawn literally —
 * every one of them is an office that would have accepted the application,
 * transferred it, and restarted the citizen's thirty days.
 */
export function RoutingFan({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 460 260"
      fill="none"
      role="img"
      aria-label="One grievance fanning out towards several possible government offices, with a single correct office highlighted."
      className={className}
    >
      {/* The grievance */}
      <g className="text-foreground">
        <rect x="10" y="98" width="104" height="64" rx="10" fill="currentColor" opacity="0.06" />
        <rect x="10" y="98" width="104" height="64" rx="10" stroke="currentColor" strokeWidth="2.5" opacity="0.35" />
        <path
          d="M30 118h64M30 130h64M30 142h38"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>

      {/* Wrong turns */}
      <g className="text-muted-foreground" opacity="0.4">
        <path d="M114 130C190 130 210 34 320 34" stroke="currentColor" strokeWidth="2" strokeDasharray="4 7" />
        <path d="M114 130C190 130 210 88 320 88" stroke="currentColor" strokeWidth="2" strokeDasharray="4 7" />
        <path d="M114 130C190 130 210 222 320 222" stroke="currentColor" strokeWidth="2" strokeDasharray="4 7" />
        <rect x="320" y="18" width="130" height="32" rx="7" stroke="currentColor" strokeWidth="2" />
        <rect x="320" y="72" width="130" height="32" rx="7" stroke="currentColor" strokeWidth="2" />
        <rect x="320" y="206" width="130" height="32" rx="7" stroke="currentColor" strokeWidth="2" />
        <path d="M336 34h58M336 88h74M336 222h64" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* The match */}
      <path
        d="M114 130C190 130 210 152 320 152"
        className="text-primary"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <g className="text-primary">
        <rect x="320" y="132" width="130" height="40" rx="9" fill="currentColor" opacity="0.12" />
        <rect x="320" y="132" width="130" height="40" rx="9" stroke="currentColor" strokeWidth="3" />
        <path
          d="M338 152l6.5 6.5L357 146"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M372 147h58M372 159h36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
      </g>
    </svg>
  );
}

/**
 * The rewrite: a question becoming an itemized list of records.
 *
 * The left sheet is what a citizen writes and an authority may lawfully
 * refuse; the right is the same grievance asked as documents that exist on a
 * file, which it cannot.
 */
export function QuestionToRecords({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 460 240"
      fill="none"
      role="img"
      aria-label="A page containing a question transforming into a page containing a numbered list of document requests."
      className={className}
    >
      {/* Refusable */}
      <g className="text-destructive">
        <rect x="16" y="24" width="156" height="192" rx="12" fill="currentColor" opacity="0.06" />
        <rect x="16" y="24" width="156" height="192" rx="12" stroke="currentColor" strokeWidth="2.5" opacity="0.4" />
        <path
          d="M74 98a20 20 0 1 1 26 19v13"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="100" cy="152" r="5" fill="currentColor" />
        <path d="M44 186h100" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      </g>

      {/* Arrow */}
      <path
        d="M192 120h56m0 0-13-11m13 11-13 11"
        className="text-muted-foreground"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Compellable */}
      <g className="text-success">
        <rect x="288" y="24" width="156" height="192" rx="12" fill="currentColor" opacity="0.07" />
        <rect x="288" y="24" width="156" height="192" rx="12" stroke="currentColor" strokeWidth="2.5" opacity="0.45" />
        {[0, 1, 2, 3].map((row) => (
          <g key={row} transform={`translate(0 ${row * 40})`}>
            <circle cx="314" cy="66" r="8" fill="currentColor" opacity="0.9" />
            <path
              d="M310.5 66l2.5 2.5 5-5"
              stroke="var(--success-foreground)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M332 61h82M332 71h54"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.45"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

/**
 * The statutory clock: thirty days to reply, then thirty to appeal.
 *
 * Drawn as a track rather than a dial, because the point is that the time runs
 * out and something specific becomes possible at the end of it — which a clock
 * face does not say.
 */
export function StatutoryClock({
  className,
  labels,
}: {
  className?: string;
  /*
   * Passed in rather than hardcoded: these are visible words, and the rest of
   * the interface is bilingual. An illustration full of English on the Hindi
   * page would undo that.
   */
  labels: { filed: string; deadline: string; appealCloses: string; alt: string };
}) {
  return (
    <svg
      viewBox="0 0 640 190"
      fill="none"
      role="img"
      aria-label={labels.alt}
      className={className}
    >
      {/* Track */}
      <rect x="24" y="86" width="592" height="18" rx="9" className="text-muted" fill="currentColor" />
      {/* Response window, elapsed */}
      <rect x="24" y="86" width="312" height="18" rx="9" className="text-primary" fill="currentColor" />
      {/* Appeal window */}
      <rect x="336" y="86" width="280" height="18" rx="9" className="text-warning" fill="currentColor" opacity="0.32" />

      {/* Filed */}
      <g className="text-primary">
        <circle cx="30" cy="95" r="10" fill="currentColor" />
        <path d="M30 70V50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        <text x="30" y="42" textAnchor="middle" className="fill-current text-[13px] font-semibold">
          {labels.filed}
        </text>
      </g>

      {/* Deadline */}
      <g className="text-destructive">
        <path d="M336 50v76" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M336 50h52l-10 12 10 12h-52z" fill="currentColor" />
        <text x="336" y="150" textAnchor="middle" className="fill-current text-[13px] font-semibold">
          {labels.deadline}
        </text>
      </g>

      {/* Appeal closes */}
      <g className="text-warning">
        <circle cx="610" cy="95" r="10" fill="currentColor" />
        <path d="M610 70V50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <text x="610" y="42" textAnchor="end" className="fill-current text-[13px] font-semibold">
          {labels.appealCloses}
        </text>
      </g>

      {/* Day ticks */}
      <g className="text-border">
        {Array.from({ length: 19 }).map((_, i) => (
          <path
            key={i}
            d={`M${54 + i * 30} 112v9`}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * A jaali band, for texture behind a section rather than a plain rule.
 * Purely decorative, so it is hidden from assistive technology.
 */
export function JaaliBand({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 200"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <JaaliDefs id="jaali-band" />
      <rect width="1200" height="200" fill="url(#jaali-band)" />
    </svg>
  );
}
