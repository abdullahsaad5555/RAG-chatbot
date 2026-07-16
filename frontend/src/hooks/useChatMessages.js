import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../api/client";

export default function useChatMessages(activeChatId, onTitleGenerated) {
    const [chatHistory, setChatHistory] = useState([]);
    const [isSending, setIsSending] = useState(false);


    // Load messages whenever active chat changes
    useEffect(() => {
        if (!activeChatId) {
            setChatHistory([]);
            return;
        }

        let mounted = true;

        (async () => {
            try {
                const data = await apiFetch(`/chats/${activeChatId}/messages?limit=50`);
                if (!mounted) return;

                // Backend now returns { messages, has_more, next_cursor }
                const msgs = data?.messages ?? [];

                const normalized = msgs.map((m) => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    ts: m.created_at ?? new Date().toISOString(),
                    typing: false,
                }));

                setChatHistory(normalized);
            } catch (e) {
                console.error("Failed to load messages:", e);
                setChatHistory([]);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [activeChatId]);

    const sendMessage = useCallback(
        async (trimmed) => {
            if (!activeChatId || !trimmed) return;

            const isFirstMessage = chatHistory.length === 0;


            if (isFirstMessage && onTitleGenerated) {
                onTitleGenerated(activeChatId, trimmed.slice(0, 60), { onlyIfDefault: true });
            }


            const userMsg = {
                id: crypto.randomUUID(),
                role: "user",
                content: trimmed,
                ts: new Date().toISOString(),
            };

            const typingId = crypto.randomUUID();

            const botTyping = {
                id: typingId,
                role: "bot",
                content: "",
                ts: new Date().toISOString(),
                typing: true,
            };

            setChatHistory((p) => [...p, userMsg, botTyping]);
            setIsSending(true);

            try {
                const data = await apiFetch(`/chat?chat_id=${activeChatId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: trimmed }),
                });

                const replyText = data?.reply ?? "No reply returned from backend.";

                setChatHistory((p) =>
                    p.map((m) =>
                        m.id === typingId
                            ? {
                                ...m,
                                content: replyText,
                                typing: false,
                            }
                            : m
                    )
                );
            } catch (e) {
                setChatHistory((p) =>
                    p.map((m) =>
                        m.id === typingId
                            ? {
                                ...m,
                                content: `⚠️ ${e.message}`,
                                typing: false,
                            }
                            : m
                    )
                );
            } finally {
                setIsSending(false);
            }
        },
        [activeChatId, chatHistory.length, onTitleGenerated]
    );

    const clearChat = useCallback(async () => {
        if (!activeChatId) return;

        // Optimistic: clear UI immediately
        const previous = chatHistory;
        setChatHistory([]);

        try {
            await apiFetch(`/chats/${activeChatId}/messages`, {
                method: "DELETE",
            });

            // Optional: also reset the sidebar title back to "New Chat"
            if (onTitleGenerated) {
                onTitleGenerated(activeChatId, "New Chat");
            }
        } catch (e) {
            console.error("Failed to clear chat:", e);
            // Rollback on error
            setChatHistory(previous);
        }
    }, [activeChatId, chatHistory, onTitleGenerated]);

    return {
        chatHistory,
        setChatHistory,
        isSending,
        sendMessage,
        clearChat,
    };
}