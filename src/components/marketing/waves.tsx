const WAVE_A =
  "M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,128C672,117,768,139,864,165.3C960,192,1056,224,1152,213.3C1248,203,1344,149,1440,160L1440,320L0,320Z";
const WAVE_B =
  "M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,149.3C672,149,768,171,864,165.3C960,160,1056,128,1152,122.7C1248,117,1344,139,1440,96L1440,320L0,320Z";
const WAVE_C =
  "M0,192L48,197.3C96,203,192,213,288,202.7C384,192,480,160,576,165.3C672,171,768,213,864,218.7C960,224,1056,192,1152,176C1248,160,1344,160,1440,192L1440,320L0,320Z";

function WavePair({ d, fill }: { d: string; fill: string }) {
  return (
    <>
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden>
        <path fill={fill} d={d} />
      </svg>
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden>
        <path fill={fill} d={d} />
      </svg>
    </>
  );
}

/** Full-bleed animated waves used as the hero backdrop (matches the original site). */
export function HeroWaves() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="wave-layer wave-1 h-[35%] sm:h-[40%] lg:h-[50%]">
        <WavePair d={WAVE_A} fill="rgba(0, 230, 255, 0.04)" />
      </div>
      <div className="wave-layer wave-2 h-[28%] sm:h-[32%] lg:h-[40%]">
        <WavePair d={WAVE_B} fill="rgba(0, 230, 255, 0.05)" />
      </div>
      <div className="wave-layer wave-3 h-[22%] sm:h-[25%] lg:h-[30%]">
        <WavePair d={WAVE_C} fill="rgba(18, 50, 106, 0.4)" />
      </div>
      <div
        className="absolute top-0 left-0 h-[600px] w-[600px] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(18, 50, 106, 0.4) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/4 right-[10%] h-[400px] w-[400px] rounded-full blur-[100px]"
        style={{ background: "var(--color-teal)", opacity: 0.06 }}
      />
    </div>
  );
}

export function WaveBand() {
  return (
    <div className="pointer-events-none relative h-24 overflow-hidden sm:h-32">
      <div className="wave-layer wave-1 h-full">
        <WavePair d={WAVE_A} fill="rgba(18, 50, 106, 0.45)" />
      </div>
      <div className="wave-layer wave-2 h-full">
        <WavePair d={WAVE_B} fill="rgba(0, 230, 255, 0.08)" />
      </div>
    </div>
  );
}
