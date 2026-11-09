import { useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import yasrefLogo from '../assets/yasrefLogo.png';
import useTheme from '../hooks/useTheme';

export default function Header({ hasChat, onClear }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const handleConfirm = () => {
        onClear();
        setShowConfirm(false);
    };

    return (
        <>
            <nav className="relative z-10 flex items-center justify-between px-8 py-5">
                <span className="text-sm font-semibold tracking-widest">
                    <img src={yasrefLogo} alt='yasref logo' className="w-32"></img>
                </span>

                <button
                    onClick={() => setShowConfirm(true)}
                    type="button"
                    className={`text-m transition-opacity hover:opacity-60 ${hasChat
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                        }`}
                    style={{ color: "var(--text-primary)" }}
                >
                    CLEAR CHAT
                </button>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="rounded-lg border p-2 transition-colors hover:opacity-80"
                        style={{
                            borderColor: "var(--border-subtle)",
                            background: "var(--bg-glass)",
                            color: "var(--text-secondary)",
                        }}
                        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                    >
                        {theme === "dark" ? <FiSun size={14} /> : <FiMoon size={14} />}
                    </button>
                </div>
            </nav>

            {showConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ background: "var(--bg-modal-overlay)" }}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl"
                        style={{
                            background: "var(--bg-modal)",
                            borderColor: "var(--border-subtle)",
                        }}
                    >
                        <div
                            className="mb-2 text-base font-semibold"
                            style={{ color: "var(--text-primary)" }}
                        >
                            Clear this chat?
                        </div>

                        <p
                            className="mb-4 text-sm"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            This will permanently delete all messages in this chat.
                            The chat itself will be kept but reset.
                            This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                className="rounded-lg px-3 py-2 text-sm hover:opacity-80"
                                style={{
                                    background: "var(--bg-button)",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                                style={{ background: "var(--accent-danger)" }}
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