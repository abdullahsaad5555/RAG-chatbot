import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatLayout from "./components/ChatLayout";
import useChats from "./hooks/useChats";

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

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen w-screen bg-[#09090b] overflow-hidden font-sans text-white">
            <Sidebar
                chats={chats}
                activeChatId={activeChatId}
                setActiveChatId={setActiveChatId}
                createChat={createChat}
                deleteChat={deleteChat}
                loadingChats={loadingChats}
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