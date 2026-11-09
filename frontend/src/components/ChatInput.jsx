export default function ChatInput({
    message,
    setMessage,
    onSend,
    isSending,
    isDisabled,
}) {
    return (
        <div className="absolute bottom-8 left-1/2 z-10 w-[92%] max-w-2xl -translate-x-1/2">
            <div
                className="flex items-center gap-3 rounded-2xl border px-5 py-4 backdrop-blur-2xl"
                style={{
                    background: "var(--bg-glass)",
                    borderColor: "var(--border-subtle)",
                }}
            >
                <input
                    value={message}
                    disabled={isSending}
                    maxLength={4000}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSend()}
                    placeholder={isSending ? "YasrefAI is typing…" : "Message YasrefAI..."}
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: "var(--text-secondary)" }}
                />
                <button
                    onClick={onSend}
                    disabled={isDisabled}
                    className="h-9 w-9 rounded-xl hover:opacity-80 disabled:opacity-40"
                    style={{
                        background: "var(--bg-glass-strong)",
                        color: "var(--text-primary)",
                    }}
                >
                    ➤
                </button>
            </div>
        </div>
    );
}