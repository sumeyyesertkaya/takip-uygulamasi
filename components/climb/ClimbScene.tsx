type ClimbSceneProps = {
  /** 0-1: hiker'ın tepedeki konumu */
  progress: number;
  walking: boolean;
  resting: boolean;
  summit: boolean;
  night: boolean;
  rain: boolean;
};

// Ön tepenin yüzeyi: kübik Bézier
const P = [
  [14, 138],
  [92, 130],
  [146, 94],
  [194, 50],
] as const;

function surfacePoint(s: number): { x: number; y: number } {
  const u = 1 - s;
  const [p0, p1, p2, p3] = P;
  return {
    x: u * u * u * p0[0] + 3 * u * u * s * p1[0] + 3 * u * s * s * p2[0] + s * s * s * p3[0],
    y: u * u * u * p0[1] + 3 * u * u * s * p1[1] + 3 * u * s * s * p2[1] + s * s * s * p3[1],
  };
}

// Yürüyüşçünün sahneye göre boyutu
const HIKER_SCALE = 0.62;

const STARS = [
  [150, 18],
  [176, 34],
  [212, 16],
  [120, 30],
  [226, 38],
];

export function ClimbScene({ progress, walking, resting, summit, night, rain }: ClimbSceneProps) {
  const s = summit ? 0.95 : Math.min(Math.max(progress, 0), 1) * 0.84;
  const { x, y } = surfacePoint(s);
  // Ayakta kalça yüzeyin bacak boyu kadar üstünde, otururken yüzeyde
  const hipY = resting ? y : y - 10 * HIKER_SCALE;

  return (
    <svg viewBox="0 0 240 160" className="block w-full" role="img" aria-label="Tırmanış sahnesi">
      {/* arka tepeler */}
      <path
        d="M0,112 C60,104 118,84 168,42 C196,22 226,30 240,46 L240,160 L0,160 Z"
        fill="var(--foreground)"
        opacity="0.07"
      />
      <path
        d="M0,126 C70,118 124,102 170,66 C200,44 224,52 240,66 L240,160 L0,160 Z"
        fill="var(--foreground)"
        opacity="0.12"
      />
      {/* ön tepe (hiker bu yüzeyde yürür) */}
      <path
        d="M0,160 L0,138 L14,138 C92,130 146,94 194,50 C212,36 232,42 240,56 L240,160 Z"
        fill="var(--foreground)"
        opacity="0.2"
      />

      {/* ot tutamları */}
      <g stroke="var(--foreground)" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none">
        <path d="M64,127 l-2,-6 M64,127 l1,-7 M64,127 l3,-5" />
        <path d="M118,106 l-2,-6 M118,106 l1,-7 M118,106 l3,-5" />
      </g>

      {/* gökyüzü: gece */}
      {night && (
        <g fill="var(--foreground)" opacity="0.55">
          <path d="M60,16 a9,9 0 1,0 7,15 a7.5,7.5 0 0,1 -7,-15z" />
          {STARS.map(([sx, sy]) => (
            <circle key={`${sx}-${sy}`} cx={sx} cy={sy} r="1.2" />
          ))}
        </g>
      )}

      {/* gökyüzü: yağmur */}
      {rain && (
        <g>
          <g fill="var(--foreground)" opacity="0.3">
            <ellipse cx="62" cy="26" rx="16" ry="7" />
            <ellipse cx="52" cy="29" rx="10" ry="6" />
            <ellipse cx="73" cy="29" rx="10" ry="6" />
          </g>
          <g stroke="var(--foreground)" strokeWidth="1.2" strokeLinecap="round" opacity="0.4">
            {[48, 56, 64, 72, 80].map((dx, i) => (
              <line
                key={dx}
                x1={dx}
                y1="38"
                x2={dx - 1.5}
                y2="43"
                className="rain-drop"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </g>
        </g>
      )}

      {/* zirvedeki bayrak */}
      <g
        style={{ opacity: summit ? 1 : 0, transition: "opacity 0.8s ease 0.8s" }}
        stroke="var(--foreground)"
        strokeLinecap="round"
      >
        <line x1="200" y1="46" x2="200" y2="22" strokeWidth="1.6" />
        <path d="M200,22 L214,27 L200,32 Z" fill="var(--foreground)" strokeWidth="0.5" />
        <g strokeWidth="1.2" opacity="0.6">
          <line x1="190" y1="16" x2="186" y2="12" />
          <line x1="200" y1="12" x2="200" y2="7" />
          <line x1="210" y1="16" x2="214" y2="12" />
        </g>
      </g>

      {/* yürüyüşçü: kalça (0,0) noktasında, sağa bakıyor */}
      <g
        className={walking ? "walking" : ""}
        style={{
          transform: `translate(${x}px, ${hipY}px) scale(${HIKER_SCALE})`,
          transition: "transform 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <g stroke="var(--foreground)" strokeLinecap="round" fill="none">
          {resting ? (
            <>
              <path d="M0,0 L11,0" strokeWidth="3" />
              <path d="M0,0 L8,4" strokeWidth="3" opacity="0.7" />
            </>
          ) : (
            <>
              <line className="leg leg-a" x1="0" y1="0" x2="0" y2="10" strokeWidth="3" />
              <line className="leg leg-b" x1="0" y1="0" x2="0" y2="10" strokeWidth="3" opacity="0.7" />
            </>
          )}
        </g>
        <g transform={resting ? "" : "rotate(6)"}>
          <rect x="-9" y="-16" width="6" height="11" rx="2" fill="var(--foreground)" opacity="0.5" />
          <rect x="-4" y="-17" width="9" height="17" rx="3" fill="var(--foreground)" opacity="0.9" />
          <circle cx="1.5" cy="-22" r="4.2" fill="var(--foreground)" />
          <line
            x1="1"
            y1="-14"
            x2="6"
            y2={summit ? -24 : -8}
            stroke="var(--foreground)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        {resting && (
          <g fill="var(--foreground)" opacity="0.35">
            <circle cx="9" cy="-26" r="1.2" />
            <circle cx="13" cy="-30" r="1.8" />
            <circle cx="19" cy="-35" r="2.6" />
          </g>
        )}
      </g>
    </svg>
  );
}
