export function SkeletonBar({ className = "", style }) {
    return (
        <div
            className={`animate-pulse rounded ${className}`}
            style={{ background: "var(--bg-glass-strong)", ...style }}
        />
    );
}

export function SidebarChatSkeleton() {
    const widths = [80, 65, 90, 55, 75, 70];

    return (
        <div className="flex flex-col gap-1 px-3 py-1">
            {widths.map((w, i) => (
                <div
                    key={i}
                    className="flex items-center justify-between gap-2 px-3 py-2"
                >
                    <SkeletonBar className="h-4" style={{ width: `${w}%` }} />
                </div>
            ))}
        </div>
    );
}