import { useState } from "react";
import yasrefLogo from '../assets/yasrefLogo.png'

export default function Header({ hasChat, onClear }) {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleConfirm = () => {
        onClear();
        setShowConfirm(false);
    };

    return (
        <>
            <nav className="relative z-10 flex items-center justify-between px-8 py-5">
                <span className="text-sm font-semibold tracking-widest text-white/80">
                    <img src={yasrefLogo} alt='yasref logo' className="w-32" />
                </span>

                <button
                    onClick={() => setShowConfirm(true)}
                    type="button"
                    className={`text-m text-white hover:text-white/60 transition-opacity ${hasChat
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                        }`}
                >
                    CLEAR CHAT
                </button>

                <div className="flex items-center gap-4">
                    #about
                </div>
            </nav>

            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl">
                        <div className="mb-2 text-base font-semibold text-white">
                            Clear this chat?
                        </div>

                        <p className="mb-4 text-sm text-white/60">
                            This will permanently delete all messages in this chat.
                            The chat itself will be kept but reset.
                            This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white/70 hover:bg-zinc-700"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="rounded-lg bg-red-500/90 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}