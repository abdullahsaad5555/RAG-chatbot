import { useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

export default function Sidebar({
    chats,
    totalChatsCount,
    searchQuery,
    setSearchQuery,
    activeChatId,
    setActiveChatId,
    createChat,
    deleteChat,
    loadingChats,
    isOpen,
    onOpen,
    onClose,
}) {
    return (
        <>
            {/* MOBILE: overlay */}
            <div
                className={[
                    "fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden",
                    isOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none",
                ].join(" ")}
                onClick={onClose}
            />

            {/* MOBILE: drawer */}
            <aside
                className={[
                    "fixed z-40 top-0 left-0 h-full w-64 md:hidden",
                    "border-r border-zinc-800 bg-black/20 backdrop-blur",
                    "flex flex-col",
                    "transform transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
            >
                <div className="flex items-center justify-between px-3 py-3 border-b border-zinc-800">
                    <span className="text-xs tracking-widest text-white/60">
                        CHATS
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-white/60 hover:text-white"
                        aria-label="Close sidebar"
                        title="Close"
                    >
                        <IoMdCloseCircle />
                    </button>
                </div>

                <SidebarContent
                    chats={chats}
                    totalChatsCount={totalChatsCount}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeChatId={activeChatId}
                    setActiveChatId={(id) => {
                        setActiveChatId(id);
                        onClose();
                    }}
                    createChat={createChat}
                    deleteChat={deleteChat}
                    loadingChats={loadingChats}
                    showHideButton
                    onHide={onClose}
                />
            </aside>

            {/* DESKTOP: sidebar */}
            <aside
                className={[
                    "hidden md:flex h-full border-r border-zinc-800 bg-black/20 backdrop-blur",
                    "flex-col overflow-hidden",
                    "transition-[width] duration-300 ease-in-out",
                    isOpen ? "w-64" : "w-12",
                ].join(" ")}
            >
                <div className="flex items-center justify-between px-3 py-3 border-b border-zinc-800">
                    <span
                        className={`text-xs tracking-widest text-white/60 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        CHATS
                    </span>

                    <button
                        type="button"
                        onClick={isOpen ? onClose : onOpen}
                        className="text-white/60 hover:text-white"
                        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                        title={isOpen ? "Hide sidebar" : "Show sidebar"}
                    >
                        {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
                    </button>
                </div>

                {isOpen ? (
                    <div className="flex flex-1 min-h-0 flex-col">
                        <SidebarContent
                            chats={chats}
                            totalChatsCount={totalChatsCount}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            activeChatId={activeChatId}
                            setActiveChatId={setActiveChatId}
                            createChat={createChat}
                            deleteChat={deleteChat}
                            loadingChats={loadingChats}
                            showHideButton={false}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-[10px] text-white/30 rotate-90 select-none">
                        CHATS
                    </div>
                )}
            </aside>
        </>
    );
}

function SidebarContent({
    chats,
    totalChatsCount,
    searchQuery,
    setSearchQuery,
    activeChatId,
    setActiveChatId,
    createChat,
    deleteChat,
    loadingChats,
    showHideButton,
    onHide,
}) {
    const [chatToDelete, setChatToDelete] = useState(null);

    const canDeleteChats = totalChatsCount > 1;
    const isSearching = searchQuery.trim().length > 0;

    const handleConfirmDelete = () => {
        if (!chatToDelete) return;
        if (!canDeleteChats) return;

        deleteChat(chatToDelete.id);
        setChatToDelete(null);
    };

    return (
        <>
            <button
                onClick={createChat}
                className="m-3 p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-sm"
                type="button"
            >
                + New Chat
            </button>

            <div className="mx-3 mb-3">
                <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.04] px-2">
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search chats..."
                        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white/80 placeholder:text-white/30 outline-none"
                    />

                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="text-xs text-white/40 hover:text-white"
                            aria-label="Clear search"
                            title="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto sleek-scrollbar">
                {loadingChats && (
                    <div className="px-3 py-2 text-xs text-white/40">
                        Loading…
                    </div>
                )}

                {!loadingChats && chats.length === 0 && (
                    <div className="px-3 py-2 text-xs text-white/40">
                        {isSearching
                            ? "No matching chats found."
                            : "No chats yet. Create one."}
                    </div>
                )}

                {chats.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => setActiveChatId(chat.id)}
                        className={`flex items-center justify-between gap-2 px-3 py-2 cursor-pointer
                            ${chat.id === activeChatId
                                ? "bg-zinc-800"
                                : "hover:bg-zinc-900"
                            }`}
                    >
                        <span className="min-w-0 flex-1 truncate text-sm text-white/80">
                            {chat.title || "New Chat"}
                        </span>

                        <button
                            type="button"
                            disabled={!canDeleteChats}
                            className={[
                                "shrink-0 transition-colors",
                                canDeleteChats
                                    ? "text-zinc-400 hover:text-red-400 cursor-pointer"
                                    : "text-zinc-700 cursor-not-allowed opacity-40",
                            ].join(" ")}
                            onClick={(e) => {
                                e.stopPropagation();

                                if (!canDeleteChats) return;

                                setChatToDelete(chat);
                            }}
                            aria-label={
                                canDeleteChats
                                    ? "Delete chat"
                                    : "Cannot delete the last chat"
                            }
                            title={
                                canDeleteChats
                                    ? "Delete chat"
                                    : "At least one chat is required"
                            }
                        >
                            <IoMdCloseCircle />
                        </button>
                    </div>
                ))}
            </div>

            {showHideButton && (
                <button
                    className="m-3 p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-sm"
                    type="button"
                    onClick={onHide}
                >
                    Hide Sidebar
                </button>
            )}

            {chatToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl">
                        <div className="mb-2 text-base font-semibold text-white">
                            Delete chat?
                        </div>

                        <p className="mb-4 text-sm text-white/60">
                            Are you sure you want to delete{" "}
                            <span className="text-white/90">
                                “{chatToDelete.title || "New Chat"}”
                            </span>
                            ? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setChatToDelete(null)}
                                className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white/70 hover:bg-zinc-700"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="rounded-lg bg-red-500/90 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}