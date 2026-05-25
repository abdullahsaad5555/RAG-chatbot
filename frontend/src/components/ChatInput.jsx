export default function ChatInput({
    message,
    setMessage,
    onSend,
    isSending,
    isDisabled,
}) {
    return (
        <div className="absolute bottom-8 left-1/2 z-10 w-[92%] max-w-2xl -translate-x-1/2">
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 backdrop-blur-2xl">
                <input
                    value={message}
                    disabled={isSending}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSend()}
                    placeholder={isSending ? "YasrefAI is typing…" : "Message YasrefAI..."}
                    className="flex-1 bg-transparent text-sm text-white/70 outline-none"
                />
                <button

                    onClick={() => {
                        console.log("SEND BUTTON CLICKED");
                        alert("SEND BUTTON CLICKED");
                        onSend();
                    }}
                    disabled={isDisabled}
                    className="h-9 w-9 rounded-xl bg-white/[0.1]"
                >
                    ➤
                </button>
            </div>
        </div>
    );
}