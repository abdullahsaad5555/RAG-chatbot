import ChatMessage from "./ChatMessage";

export default function ChatPane({ chatHistory, bottomRef }) {
    return (
        <div className="absolute inset-x-0 top-[84px] bottom-[168px] z-10 sleek-scrollbar">
            <div className="mx-auto h-full w-[92%] max-w-2xl">
                <div className="h-full overflow-y-auto rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl px-4 py-4">
                    <div className="flex flex-col gap-3">
                        {chatHistory.map((m) => (
                            <ChatMessage key={m.id} message={m} />
                        ))}
                        <div ref={bottomRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}