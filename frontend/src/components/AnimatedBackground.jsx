import { useMemo } from "react";
import "../styles/animatedBackground.css";

const PARTICLE_COUNT = 100;

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

export default function AnimatedBackground() {
    const particles = useMemo(() => {
        return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
            const size = randomBetween(1.5, 4.5);
            const left = randomBetween(0, 100);
            const duration = randomBetween(14, 34);
            const delay = randomBetween(-34, 0);
            const opacity = randomBetween(0.08, 0.35);
            const drift = randomBetween(-45, 45);
            const blur = randomBetween(0, 1.8);

            const animationType = index % 4;

            return {
                id: index,
                style: {
                    "--size": `${size}px`,
                    "--left": `${left}%`,
                    "--duration": `${duration}s`,
                    "--delay": `${delay}s`,
                    "--opacity": opacity,
                    "--drift": `${drift}px`,
                    "--blur": `${blur}px`,
                },
                className: `snowflake snowflake-${animationType}`,
            };
        });
    }, []);

    return (
        <div className="animated-bg" aria-hidden="true">
            <div className="bg-glow bg-glow-one" />
            <div className="bg-glow bg-glow-two" />
            <div className="bg-glow bg-glow-three" />

            {particles.map((particle) => (
                <span
                    key={particle.id}
                    className={particle.className}
                    style={particle.style}
                />
            ))}
        </div>
    );
}