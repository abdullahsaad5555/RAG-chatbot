import {
    FiUsers, FiShield, FiActivity, FiFileText, FiArrowUpRight,
} from "react-icons/fi";

const SUGGESTED_PROMPTS = [
    {
        icon: <FiUsers size={16} />, title: "HR Policies",
        prompt: "What is YASREF's annual leave policy?"
    },
    {
        icon: <FiShield size={16} />, title: "Safety Procedures",
        prompt: "Show me the plant safety protocol for shutdowns."
    },
    {
        icon: <FiActivity size={16} />, title: "Plant Operations",
        prompt: "Summarize the last week's PI system anomalies."
    },
    {
        icon: <FiFileText size={16} />, title: "Document Lookup",
        prompt: "Find the latest supply chain vendor list."
    },
];

// 32 particles bursting outward from center
const PARTICLES = Array.from({ length: 32 }, (_, i) => {
    const angle = (i / 32) * Math.PI * 2 + Math.random() * 0.4;
    const distance = 350 + Math.random() * 250;
    const colors = ["#d32f2f", "#43a047", "#6366f1", "#f59e0b", "#ec4899", "#22d3ee"];
    return {
        px: `${Math.cos(angle) * distance}px`,
        py: `${Math.sin(angle) * distance}px`,
        color: colors[i % colors.length],
        duration: `${1.4 + Math.random() * 0.8}s`,
        delay: `${0.5 + Math.random() * 0.3}s`,
    };
});

// Comets from different corners
const COMETS = [
    {
        fromX: "-20vw", fromY: "10vh", toX: "120vw", toY: "40vh", angle: "-15deg",
        color: "rgba(211, 47, 47, 0.9)", delay: "0.2s"
    },
    {
        fromX: "120vw", fromY: "20vh", toX: "-20vw", toY: "60vh", angle: "165deg",
        color: "rgba(67, 160, 71, 0.85)", delay: "0.5s"
    },
    {
        fromX: "-20vw", fromY: "80vh", toX: "120vw", toY: "50vh", angle: "8deg",
        color: "rgba(99, 102, 241, 0.85)", delay: "0.8s"
    },
    {
        fromX: "50vw", fromY: "-20vh", toX: "60vw", toY: "120vh", angle: "70deg",
        color: "rgba(245, 158, 11, 0.85)", delay: "1.1s"
    },
];

// Big pulse orbs at 4 corners
const PULSE_ORBS = [
    {
        top: "10%", left: "10%", w: "300px", h: "300px",
        bg: "rgba(211, 47, 47, 0.4)", delay: "0.3s"
    },
    {
        top: "10%", right: "10%", w: "300px", h: "300px",
        bg: "rgba(67, 160, 71, 0.4)", delay: "0.6s"
    },
    {
        bottom: "15%", left: "20%", w: "280px", h: "280px",
        bg: "rgba(99, 102, 241, 0.4)", delay: "0.9s"
    },
    {
        bottom: "10%", right: "15%", w: "280px", h: "280px",
        bg: "rgba(236, 72, 153, 0.35)", delay: "1.2s"
    },
];

// Tornado letter reveal — each letter flies from a random direction
function TornadoText({ text, baseDelay = 0 }) {
    return (
        <>
            {text.split("").map((ch, i) => (
                <span
                    key={i}
                    className="grand-letter"
                    style={{ "--letter-delay": `${baseDelay + i * 0.04}s` }}
                >
                    {ch === " " ? "\u00a0" : ch}
                </span>
            ))}
        </>
    );
}

export default function Landing({ onPromptSelect }) {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 px-6 py-12 pointer-events-none overflow-hidden">
            {/* ===== GRAND ENTRANCE LAYERS ===== */}

            {/* Full-screen flash */}
            <div className="grand-flash" />
            <div className="grand-flicker" />

            {/* Diagonal curtain wipes */}
            <div className="grand-curtain grand-curtain-1" style={{ "--curtain-delay": "0s" }} />
            <div className="grand-curtain grand-curtain-2" style={{ "--curtain-delay": "0.15s" }} />
            <div className="grand-curtain grand-curtain-3" style={{ "--curtain-delay": "0.3s" }} />

            {/* Radial shockwaves from center */}
            <div className="grand-shockwave"
                style={{ "--shock-delay": "0.4s", borderColor: "rgba(211, 47, 47, 0.8)" }} />
            <div className="grand-shockwave"
                style={{ "--shock-delay": "0.7s", borderColor: "rgba(67, 160, 71, 0.7)" }} />
            <div className="grand-shockwave"
                style={{ "--shock-delay": "1.0s", borderColor: "rgba(99, 102, 241, 0.7)" }} />

            {/* 32 particles burst outward */}
            {PARTICLES.map((p, i) => (
                <div
                    key={`p-${i}`}
                    className="grand-particle"
                    style={{
                        "--px": p.px,
                        "--py": p.py,
                        "--particle-color": p.color,
                        "--particle-duration": p.duration,
                        "--particle-delay": p.delay,
                    }}
                />
            ))}

            {/* Comets from 4 directions */}
            {COMETS.map((c, i) => (
                <div
                    key={`c-${i}`}
                    className="grand-comet"
                    style={{
                        "--comet-fromX": c.fromX,
                        "--comet-fromY": c.fromY,
                        "--comet-toX": c.toX,
                        "--comet-toY": c.toY,
                        "--comet-angle": c.angle,
                        "--comet-color": c.color,
                        "--comet-delay": c.delay,
                    }}
                />
            ))}

            {/* Big backdrop pulse orbs */}
            {PULSE_ORBS.map((o, i) => (
                <div
                    key={`o-${i}`}
                    className="grand-pulse-orb"
                    style={{
                        top: o.top, left: o.left, right: o.right, bottom: o.bottom,
                        width: o.w, height: o.h,
                        background: o.bg,
                        "--pulse-delay": o.delay,
                    }}
                />
            ))}

            {/* ===== YOUR CLASSY IDLE ORB (gently fades in) ===== */}
            <div className="grand-orb-fade classy-orb shrink-0">
                <div className="classy-orb-conic" />
                <div className="classy-orb-breathe" />
                <div className="classy-orb-rim" />
                <div className="classy-orb-glass" />
                <div className="classy-orb-core" />
            </div>

            {/* ===== HEADLINE (tornado letters) ===== */}
            <div className="text-center max-w-2xl">
                <h1
                    className="text-4xl sm:text-5xl font-semibold tracking-tight"
                    style={{ color: "var(--text-primary)" }}
                >
                    <TornadoText text="Welcome to " baseDelay={1.6} />
                    <span className="brand-gradient">
                        <TornadoText text="YasrefAI" baseDelay={2.2} />
                    </span>
                </h1>

                <p className="grand-slide text-base mt-4"
                    style={{ color: "var(--text-secondary)", "--slide-delay": "3.0s" }}>
                    Your intelligent guide to YASREF knowledge — policies, procedures, plant data, and beyond.
                </p>

                <p className="grand-slide text-xs mt-2"
                    style={{ color: "var(--text-muted)", "--slide-delay": "3.2s" }}>
                    Ask anything. I'll retrieve, reason, and answer with cited sources.
                </p>
            </div>

            {/* ===== SUGGESTED PROMPTS (dealt like cards) ===== */}
            <div className="w-full max-w-2xl pointer-events-auto">
                <div
                    className="grand-slide text-xs font-semibold tracking-widest mb-3 text-center"
                    style={{ color: "var(--text-muted)", "--slide-delay": "3.4s" }}
                >
                    ✦ TRY ASKING ✦
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SUGGESTED_PROMPTS.map((p, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onPromptSelect?.(p.prompt)}
                            className="grand-card landing-card group flex items-start gap-3 rounded-xl border p-4 text-left backdrop-blur-xl"
                            style={{
                                background: "var(--bg-glass)",
                                borderColor: "var(--border-subtle)",
                                "--deal-delay": `${3.6 + i * 0.1}s`,
                            }}
                        >
                            <div
                                className="card-icon mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                style={{
                                    background: "var(--bg-glass-strong)",
                                    color: "var(--accent-primary)",
                                }}
                            >
                                {p.icon}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium mb-0.5"
                                    style={{ color: "var(--text-primary)" }}>
                                    {p.title}
                                </div>
                                <div className="text-xs line-clamp-2"
                                    style={{ color: "var(--text-muted)" }}>
                                    {p.prompt}
                                </div>
                            </div>

                            <FiArrowUpRight
                                className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                style={{ color: "var(--text-muted)" }}
                                size={14}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div
                className="grand-slide text-[10px] tracking-widest"
                style={{ color: "var(--text-faint)", "--slide-delay": "4.4s" }}
            >
                POWERED BY YASREF · INTERNAL USE ONLY
            </div>
        </div>
    );
}
