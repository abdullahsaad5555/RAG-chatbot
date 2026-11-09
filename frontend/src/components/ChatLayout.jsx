import { useMemo, useRef, useState } from "react";
import Header from "./Header";
import Landing from "./Landing";
import ChatPane from "./ChatPane";
import ChatInput from "./ChatInput";
import useChatMessages from "../hooks/useChatMessages";


export default function ChatLayout({
    activeChatId,
    onOpenSidebar,
    isSidebarOpen,
    onTitleGenerated,
}) {
    const [message, setMessage] = useState("");
    const bottomRef = useRef(null);

    const { chatHistory, isSending, sendMessage, clearChat } =
        useChatMessages(activeChatId, onTitleGenerated);

    const isDisabled = useMemo(
        () => isSending || message.trim().length === 0 || !activeChatId,
        [message, isSending, activeChatId]
    );

    const handleSend = async () => {
        if (isDisabled) return;
        const trimmed = message.trim();
        setMessage("");
        await sendMessage(trimmed);
    };

    return (
        <div className="relative flex-1">
            {/* Mobile-only: open sidebar button */}
            <button
                type="button"
                onClick={onOpenSidebar}
                className="md:hidden absolute top-4 left-4 z-30 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/70 hover:bg-white/10"
                aria-label="Open chats"
                title="Open chats"
            >
                ☰
            </button>

    {/*        {!isSidebarOpen && (*/}
    {/*            <button*/}
    {/*                type="button"*/}
    {/*                onClick={onOpenSidebar}*/}
    {/*                className="*/}
    {/*  hidden md:block*/}
    {/*  fixed left-[20px] top-[10%]*/}
    {/*  rotate-90 origin-left*/}
    {/*  bg-[#43ff8b8c]*/}
    {/*  text-[10px] font-medium*/}
    {/*  px-3 py-2*/}
    {/*  rounded-t-md*/}
    {/*  z-50*/}
    {/*  hover:bg-[#43ff8bcc]*/}
    {/*  transition-colors*/}
    {/*"*/}
    {/*                aria-label="Show chats"*/}
    {/*                title="Show chats"*/}
    {/*            >*/}
    {/*                Chats*/}
    {/*            </button>*/}
    {/*        )}*/}


            <Header hasChat={chatHistory.length > 0} onClear={clearChat} />

            {chatHistory.length === 0 && (
                <Landing onPromptSelect={(p) => setMessage(p)} />
            )}

            {chatHistory.length > 0 && (
                <ChatPane chatHistory={chatHistory} bottomRef={bottomRef} />
            )}

            <ChatInput
                message={message}
                setMessage={setMessage}
                onSend={handleSend}
                isSending={isSending}
                isDisabled={isDisabled}
            />
        </div>
    );
}
