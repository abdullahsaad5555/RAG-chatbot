import yasrefLogo from '../assets/yasrefLogo.png'
export default function Header({ hasChat, onClear }) {
    return (
        <nav className="relative z-10 flex items-center justify-between px-8 py-5">
            <span className="text-sm font-semibold tracking-widest text-white/80">
                <img src={yasrefLogo} alt='yasref logo' className="w-32" />
            </span>

            <button
                onClick={onClear}
                type="button"
                className={`text-m text-white hover:text-white/60 transition-opacity ${hasChat
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                    }`}
            >
                CLEAR CHAT
            </button>

            <div className="flex items-center gap-4">
                <a
                    href="#about"
                    className="text-xs text-white/40 hover:text-white/70"
                >
                    About
                </a>
            </div>
        </nav>
    );
}