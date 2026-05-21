export default function Landing() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 pointer-events-none">
            <div className="relative h-36 w-36">
                <div className="absolute inset-0 blur-3xl scale-150 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-cyan-400/20" />
                <div className="absolute inset-0 rounded-full border border-white/[0.08] neon-ring" />
                <div className="absolute inset-4 rounded-full bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06]" />
                <div className="absolute inset-[42%] rounded-full neon-core" />
            </div>

            <div className="text-center">
                <h1 className="text-3xl font-medium text-white/90">
                    Welcome to YasrefAI
                </h1>
                <p className="text-sm text-white/40 max-w-md mt-2">
                    Your AI guide to queries within YASREF.
                </p>
            </div>
        </div>
    );
}