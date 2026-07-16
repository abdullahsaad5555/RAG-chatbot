import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../api/client";

export default function useChats() {
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [loadingChats, setLoadingChats] = useState(true);

    // Load chat list once
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const data = await apiFetch("/chats");
                if (!mounted) return;

                setChats(data || []);
                //setActiveChatId(data?.[0]?.id ?? null);
            } catch (e) {
                console.error("Failed to load chats:", e);
            } finally {
                if (mounted) setLoadingChats(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const createChat = useCallback(async () => {
        const newChat = await apiFetch("/chats", { method: "POST" });

        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
    }, []);

    const deleteChat = useCallback(
        async (chatId) => {
            await apiFetch(`/chats/${chatId}`, { method: "DELETE" });

            setChats((prev) => prev.filter((c) => c.id !== chatId));

            // If deleting the active chat, pick the next one
            setActiveChatId((current) => {
                if (current !== chatId) return current;

                const remaining = chats.filter((c) => c.id !== chatId);
                return remaining?.[0]?.id ?? null;
            });
        },
        [chats]
    );

    const updateChatTitle = useCallback(async (chatId, title, options = {}) => {
        if (!chatId || !title?.trim()) return;

        const cleanTitle = title.trim().slice(0, 60);
        const { onlyIfDefault = false } = options;

        // Update sidebar instantly (optimistic)
        setChats((prev) =>
            prev.map((chat) => {
                if (chat.id !== chatId) return chat;

                // Skip if onlyIfDefault=true and chat already has a custom title
                if (onlyIfDefault && chat.title && chat.title !== "New Chat") {
                    return chat;
                }

                return {
                    ...chat,
                    title: cleanTitle,
                    updated_at: new Date().toISOString(),
                };
            })
        );

        // Save to backend
        try {
            await apiFetch(`/chats/${chatId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: cleanTitle }),
            });
        } catch (e) {
            console.error("Failed to update chat title:", e);
        }
    }, []);

    return {
        chats,
        activeChatId,
        setActiveChatId,
        createChat,
        deleteChat,
        loadingChats,
        updateChatTitle,
    };
}