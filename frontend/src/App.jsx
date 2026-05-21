import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatLayout from "./components/ChatLayout";
import useChats from "./hooks/useChats";
import useChatSearch from "./hooks/useChatSearch";
import AnimatedBackground from "./components/AnimatedBackground";
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

            <Sidebar
                chats={visibleChats}
                totalChatsCount={chats.length}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeChatId={activeChatId}
                setActiveChatId={setActiveChatId}
                createChat={createChat}
                deleteChat={deleteChat}
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
        </div>
    );
}