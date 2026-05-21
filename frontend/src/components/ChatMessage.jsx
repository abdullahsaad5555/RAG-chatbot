import TypingIndicator from "./TypingIndicator";

export default function ChatMessage({ message }) {
    const isUser = message.role === "user";

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={[
                    "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                    isUser
                        ? "bg-indigo-500/20 text-indigo-50"
                        : "bg-white/[0.06] text-white/80",
                ].join(" ")}
            >
                {message.typing ? (
                    <TypingIndicator />
                ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                )}
                <div className="mt-1 text-[10px] text-white/30">
                    {isUser ? "You" : "YasrefAI"}
                </div>
            </div>
        </div>
    );
}