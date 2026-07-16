import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";

const MAX_CACHE_CHATS = 25;
const MAX_CACHE_MESSAGES_PER_CHAT = 300;

export default function useChatSearch(chats) {
    const [searchQuery, setSearchQuery] = useState("");

    // Local cache:
    // {
    //   chatId: "chat title + message contents"
    // }
    const [chatSearchCache, setChatSearchCache] = useState({});

    // Backend fallback results
    const [dbSearchResults, setDbSearchResults] = useState([]);
    const [isDbSearching, setIsDbSearching] = useState(false);

    const normalizedSearch = searchQuery.trim().toLowerCase();

    const shouldUseClientCache =
        chats.length > 0 && chats.length <= MAX_CACHE_CHATS;

    const cacheReady = useMemo(() => {
        if (!shouldUseClientCache) return false;
        if (chats.length === 0) return false;

        return chats.every((chat) => chatSearchCache[chat.id]);
    }, [chats, chatSearchCache, shouldUseClientCache]);

    // Build local cache when chat count is small enough
    useEffect(() => {
        if (!shouldUseClientCache || chats.length === 0) {
            return;
        }

        let cancelled = false;

        async function buildSearchCache() {
            const entries = await Promise.all(
                chats.map(async (chat) => {
                    try {
                        const response = await apiFetch(`/chats/${chat.id}/messages?limit=${MAX_CACHE_MESSAGES_PER_CHAT}`);
                        const messages = response?.messages ?? [];

                        const limitedMessages = (messages || []).slice(
                            0,
                            MAX_CACHE_MESSAGES_PER_CHAT
                        );

                        const messagesText = limitedMessages
                            .map((msg) => msg.content || "")
                            .join(" ");

                        const searchableText = [
                            chat.title || "New Chat",
                            messagesText,
                        ]
                            .join(" ")
                            .toLowerCase();

                        return [chat.id, searchableText];
                    } catch (e) {
                        console.error(
                            `Failed to cache messages for chat ${chat.id}:`,
                            e
                        );

                        return [
                            chat.id,
                            (chat.title || "New Chat").toLowerCase(),
                        ];
                    }
                })
            );

            if (cancelled) return;

            setChatSearchCache(Object.fromEntries(entries));
        }

        buildSearchCache();

        return () => {
            cancelled = true;
        };
    }, [chats, shouldUseClientCache]);

    // Backend fallback search
    useEffect(() => {
        if (!normalizedSearch) {
            return;
        }

        // If local cache is available, no backend call needed
        if (shouldUseClientCache && cacheReady) {
            return;
        }

        let cancelled = false;

        const timeoutId = setTimeout(async () => {
            try {
                setIsDbSearching(true);

                const results = await apiFetch(
                    `/chats/search?q=${encodeURIComponent(normalizedSearch)}`
                );

                if (cancelled) return;

                setDbSearchResults(results || []);
            } catch (e) {
                console.error("Failed to search chats from DB:", e);

                if (!cancelled) {
                    setDbSearchResults([]);
                }
            } finally {
                if (!cancelled) {
                    setIsDbSearching(false);
                }
            }
        }, 250);

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [normalizedSearch, shouldUseClientCache, cacheReady]);

    const visibleChats = useMemo(() => {
        if (!normalizedSearch) {
            return chats;
        }

        if (shouldUseClientCache && cacheReady) {
            return chats.filter((chat) => {
                const searchableText =
                    chatSearchCache[chat.id] ||
                    (chat.title || "New Chat").toLowerCase();

                return searchableText.includes(normalizedSearch);
            });
        }

        return dbSearchResults;
    }, [
        chats,
        normalizedSearch,
        shouldUseClientCache,
        cacheReady,
        chatSearchCache,
        dbSearchResults,
    ]);

    const isSearching =
        Boolean(normalizedSearch) &&
        !(shouldUseClientCache && cacheReady) &&
        isDbSearching;

    return {
        searchQuery,
        setSearchQuery,
        visibleChats,
        isSearching,
        isSearchActive: Boolean(normalizedSearch),
        usingClientCache: shouldUseClientCache && cacheReady,
    };
}