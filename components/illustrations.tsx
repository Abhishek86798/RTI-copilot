/**
 * Line-art diagrams.
 *
 * One rule holds the set together: a single stroke-weight family, no fills, no
 * colour. Everything is drawn in `currentColor`, so a diagram takes the colour
 * of whatever it sits inside and dark mode needs no second copy.
 *
 * Emphasis is carried by stroke weight and dash pattern rather than by hue.
 * That keeps them legible in greyscale, when printed, and to a reader who
 * cannot separate the colours a status palette would have relied on — and it
 * keeps them quiet enough to sit beside the type without competing with it.
 *
 * Geometry sits on a coarse grid with real margins inside the viewBox. Nothing
 * touches an edge, no label crosses a rule, and the label bands above and
 * below the axis are reserved. The diagrams are set with the same care as the
 * text because they share its column.
 */

const STROKE = 1.5;
const STROKE_EMPHASIS = 2.5;

/**
 * Routing: one grievance, several offices that could take it, one that
 * actually holds the record.
 *
 * The dashed branches are the Section 6(3) risk drawn literally — each is an
 * office that would have accepted the application, transferred it, and
 * restarted the citizen's thirty days. The match is the only solid line.
 */
export function RoutingFan({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 300"
      fill="none"
      stroke="currentColor"
      role="img"
      aria-label="One grievance branching towards four possible government offices, with a single correct office marked."
      className={className}
    >
      {/* The grievance */}
      <rect x="16" y="118" width="108" height="64" rx="4" strokeWidth={STROKE} pathLength={1} data-draw />
      <path d="M36 140h68M36 152h68M36 164h40" strokeWidth={STROKE} strokeLinecap="round" />

      {/* Offices that would only transfer it onward */}
      <g strokeWidth={STROKE} opacity="0.45">
        <path d="M124 150C210 150 232 44 342 44" strokeDasharray="3 6" />
        <path d="M124 150C210 150 232 108 342 108" strokeDasharray="3 6" />
        <path d="M124 150C210 150 232 256 342 256" strokeDasharray="3 6" />
        <rect x="342" y="26" width="122" height="36" rx="4" />
        <rect x="342" y="90" width="122" height="36" rx="4" />
        <rect x="342" y="238" width="122" height="36" rx="4" />
        <path d="M360 44h58M360 108h74M360 256h64" strokeLinecap="round" opacity="0.8" />
      </g>

      {/* The office that holds the record */}
      <path
        d="M124 150C210 150 232 178 342 178"
        strokeWidth={STROKE_EMPHASIS}
        strokeLinecap="round"
        pathLength={1}
        data-draw
      />
      <rect x="342" y="156" width="122" height="44" rx="4" strokeWidth={STROKE_EMPHASIS} pathLength={1} data-draw />
      <path
        d="M360 178l7 7 13-14"
        strokeWidth={STROKE_EMPHASIS}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M392 172h54M392 186h32" strokeWidth={STROKE} strokeLinecap="round" />
    </svg>
  );
}

/**
 * The rewrite: a question becomes an itemized list of records.
 *
 * Left is what a citizen writes and an authority may lawfully refuse — drawn
 * dashed, because it is the version that does not hold. Right is the same
 * grievance asked as documents that exist on a file, which it cannot refuse
 * without naming an exemption.
 */
export function QuestionToRecords({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 260"
      fill="none"
      stroke="currentColor"
      role="img"
      aria-label="A page containing a question becoming a page containing a numbered list of document requests."
      className={className}
    >
      {/* Refusable */}
      <rect
        x="20"
        y="26"
        width="160"
        height="208"
        rx="4"
        strokeWidth={STROKE}
        strokeDasharray="4 5"
        opacity="0.55"
      />
      <path d="M82 96a18 18 0 1 1 24 17v14" strokeWidth={STROKE_EMPHASIS} strokeLinecap="round" pathLength={1} data-draw />
      <circle cx="106" cy="150" r="2.5" strokeWidth={STROKE_EMPHASIS} />
      <path d="M52 196h96" strokeWidth={STROKE} strokeLinecap="round" opacity="0.4" />

      {/* Transformation */}
      <path
        d="M208 130h64m0 0-13-11m13 11-13 11"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />

      {/* Compellable */}
      <rect x="300" y="26" width="160" height="208" rx="4" strokeWidth={STROKE_EMPHASIS} pathLength={1} data-draw />
      {[0, 1, 2, 3].map((row) => (
        <g key={row} transform={`translate(0 ${row * 46})`} strokeLinecap="round">
          <path d="M324 66l5 5 9-9" strokeWidth={STROKE_EMPHASIS} strokeLinejoin="round" />
          <path d="M352 62h84M352 74h56" strokeWidth={STROKE} opacity="0.55" />
        </g>
      ))}
    </svg>
  );
}

/**
 * The statutory clock: thirty days to reply, then thirty to appeal.
 *
 * A track rather than a dial, because the point is that the time runs out and
 * something specific becomes possible at the end of it — which a clock face
 * does not say. The response window is solid and the appeal window dashed, so
 * they read apart without needing a second colour.
 *
 * The two end labels are anchored to their own ends and the deadline label
 * sits in its own band below the ticks, so no two labels can collide and none
 * of them crosses a rule.
 */
export function StatutoryClock({
  className,
  labels,
}: {
  className?: string;
  /*
   * Passed in rather than hardcoded: these are visible words, and the rest of
   * the interface is bilingual. A diagram full of English on the Hindi page
   * would undo that.
   */
  labels: { filed: string; deadline: string; appealCloses: string; alt: string };
}) {
  const AXIS = 128;
  const START = 30;
  const DEADLINE = 330;
  const END = 610;

  return (
    <svg
      viewBox="0 0 640 210"
      fill="none"
      stroke="currentColor"
      role="img"
      aria-label={labels.alt}
      className={className}
    >
      {/* Response window: solid */}
      <path
        d={`M${START} ${AXIS}h${DEADLINE - START}`}
        strokeWidth={STROKE_EMPHASIS}
        strokeLinecap="round"
        pathLength={1}
        data-draw
      />
      {/* Appeal window: dashed */}
      <path
        d={`M${DEADLINE} ${AXIS}h${END - DEADLINE}`}
        strokeWidth={STROKE_EMPHASIS}
        strokeLinecap="round"
        strokeDasharray="2 7"
      />

      {/* Day ticks, in their own band clear of every label */}
      <g strokeWidth={STROKE} strokeLinecap="round" opacity="0.35">
        {Array.from({ length: 19 }).map((_, i) => (
          <path key={i} d={`M${START + 5 + i * 31} ${AXIS + 11}v7`} />
        ))}
      </g>

      {/* Filed */}
      <circle cx={START} cy={AXIS} r="5" strokeWidth={STROKE_EMPHASIS} />
      <path d={`M${START} ${AXIS - 13}v-24`} strokeWidth={STROKE} opacity="0.5" />
      <text
        x={START - 5}
        y={AXIS - 48}
        textAnchor="start"
        stroke="none"
        className="fill-current text-[13px] font-medium"
      >
        {labels.filed}
      </text>

      {/* Deadline: the only full-height marker */}
      <path
        d={`M${DEADLINE} ${AXIS - 34}v68`}
        strokeWidth={STROKE_EMPHASIS}
        strokeLinecap="round"
        pathLength={1}
        data-draw
      />
      <path
        d={`M${DEADLINE} ${AXIS - 34}h34l-9 11 9 11h-34z`}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <text
        x={DEADLINE}
        y={AXIS + 62}
        textAnchor="middle"
        stroke="none"
        className="fill-current text-[13px] font-medium"
      >
        {labels.deadline}
      </text>

      {/* Appeal closes */}
      <circle cx={END} cy={AXIS} r="5" strokeWidth={STROKE_EMPHASIS} />
      <path d={`M${END} ${AXIS - 13}v-24`} strokeWidth={STROKE} opacity="0.5" />
      <text
        x={END + 5}
        y={AXIS - 48}
        textAnchor="end"
        stroke="none"
        className="fill-current text-[13px] font-medium"
      >
        {labels.appealCloses}
      </text>
    </svg>
  );
}
