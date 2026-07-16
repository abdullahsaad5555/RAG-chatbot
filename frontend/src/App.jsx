import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChatLayout from "./components/ChatLayout";
import useChats from "./hooks/useChats";
import useChatSearch from "./hooks/useChatSearch";
import AnimatedBackground from "./components/AnimatedBackground";
import NotFound from "./components/NotFound";
export default function App() {
    const {
        chats,
        activeChatId,
        setActiveChatId,
        createChat,
        deleteChat,
        loadingChats,
        updateChatTitle,
    } = useChats();

    const {
        searchQuery,
        setSearchQuery,
        visibleChats,
        isSearching,
    } = useChatSearch(chats);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen w-screen bg-[#09090b] overflow-hidden font-sans text-white">
            <AnimatedBackground />

            <Routes>
                <Route
                    path="/"
                    element={
                        <ChatShell
                            chats={chats}
                            visibleChats={visibleChats}
                            activeChatId={activeChatId}
                            setActiveChatId={setActiveChatId}
                            createChat={createChat}
                            deleteChat={deleteChat}
                            updateChatTitle={updateChatTitle}
                            loadingChats={loadingChats}
                            isSearching={isSearching}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            isSidebarOpen={isSidebarOpen}
                            setIsSidebarOpen={setIsSidebarOpen}
                        />
                    }
                />
                <Route
                    path="/chat/:chatId"
                    element={
                        <ChatShell
                            chats={chats}
                            visibleChats={visibleChats}
                            activeChatId={activeChatId}
                            setActiveChatId={setActiveChatId}
                            createChat={createChat}
                            deleteChat={deleteChat}
                            updateChatTitle={updateChatTitle}
                            loadingChats={loadingChats}
                            isSearching={isSearching}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            isSidebarOpen={isSidebarOpen}
                            setIsSidebarOpen={setIsSidebarOpen}
                        />
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}

function ChatShell({
    chats,
    visibleChats,
    activeChatId,
    setActiveChatId,
    createChat,
    deleteChat,
    updateChatTitle,
    loadingChats,
    isSearching,
    searchQuery,
    setSearchQuery,
    isSidebarOpen,
    setIsSidebarOpen,
}) {
    const { chatId: urlChatId } = useParams();
    const navigate = useNavigate();

    // Sync URL → activeChatId
    useEffect(() => {
        if (loadingChats) return;

        // No URL param: pick the first chat and update URL
        if (!urlChatId) {
            if (chats.length > 0) {
                navigate(`/chat/${chats[0].id}`, { replace: true });
            }
            return;
        }

        // URL has a chat ID: verify it exists in our list
        const chatExists = chats.some((c) => c.id === urlChatId);

        if (chatExists) {
            if (urlChatId !== activeChatId) {
                setActiveChatId(urlChatId);
            }
        } else if (chats.length > 0) {
            // Invalid URL chat ID → redirect to first chat
            navigate(`/chat/${chats[0].id}`, { replace: true });
        }
    }, [urlChatId, chats, loadingChats, activeChatId, setActiveChatId, navigate]);

    // Sidebar click → update URL (which will sync back into activeChatId)
    const handleSelectChat = (chatId) => {
        navigate(`/chat/${chatId}`);
    };

    // Wrap createChat and deleteChat to navigate afterward
    const handleCreateChat = async () => {
        await createChat();
        // useChats sets the new chat as active; we need URL to catch up
        // We'll navigate via effect below after chats array updates
    };

    // Navigate to new chat's URL when created
    useEffect(() => {
        if (activeChatId && activeChatId !== urlChatId) {
            navigate(`/chat/${activeChatId}`, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChatId]);

    return (
        <>
            <Sidebar
                chats={visibleChats}
                totalChatsCount={chats.length}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeChatId={activeChatId}
                setActiveChatId={handleSelectChat}
                createChat={handleCreateChat}
                deleteChat={deleteChat}
                updateChatTitle={updateChatTitle}
                loadingChats={loadingChats || isSearching}
                isOpen={isSidebarOpen}
                onOpen={() => setIsSidebarOpen(true)}
                onClose={() => setIsSidebarOpen(false)}
            />

            <ChatLayout
                activeChatId={activeChatId}
                onOpenSidebar={() => setIsSidebarOpen(true)}
                isSidebarOpen={isSidebarOpen}
                onTitleGenerated={updateChatTitle}
            />
        </>
    );
}