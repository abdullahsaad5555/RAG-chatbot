import { useState, useRef, useEffect } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import { FiChevronRight, FiChevronLeft, FiEdit2 } from "react-icons/fi";
import { SidebarChatSkeleton } from "./Skeleton";

export default function Sidebar({
    chats,
    totalChatsCount,
    searchQuery,
    setSearchQuery,
    activeChatId,
    setActiveChatId,
    createChat,
    deleteChat,
    updateChatTitle,
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
                    "fixed inset-0 z-30 transition-opacity md:hidden",
                    isOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none",
                ].join(" ")}
                style={{ background: "var(--bg-modal-overlay)" }}
                onClick={onClose}
            />

            {/* MOBILE: drawer */}
            <aside
                className={[
                    "fixed z-40 top-0 left-0 h-full w-64 md:hidden",
                    "border-r backdrop-blur",
                    "flex flex-col",
                    "transform transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
                style={{
                    background: "var(--bg-sidebar)",
                    borderColor: "var(--border-sidebar)",
                }}
            >
                <div
                    className="flex items-center justify-between px-3 py-3 border-b"
                    style={{ borderColor: "var(--border-sidebar)" }}
                >
                    <span
                        className="text-xs tracking-widest"
                        style={{ color: "var(--text-muted)" }}
                    >
                        CHATS
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                        className="hover:opacity-80"
                        style={{ color: "var(--text-muted)" }}
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
                    updateChatTitle={updateChatTitle}
                    loadingChats={loadingChats}
                    showHideButton
                    onHide={onClose}
                />
            </aside>

            {/* DESKTOP: sidebar */}
            <aside
                className={[
                    "hidden md:flex h-full border-r backdrop-blur",
                    "flex-col overflow-hidden",
                    "transition-[width] duration-300 ease-in-out",
                    isOpen ? "w-64" : "w-12",
                ].join(" ")}
                style={{
                    background: "var(--bg-sidebar)",
                    borderColor: "var(--border-sidebar)",
                }}
            >
                <div
                    className="flex items-center justify-between px-3 py-3 border-b"
                    style={{ borderColor: "var(--border-sidebar)" }}
                >
                    <span
                        className={`text-xs tracking-widest transition-opacity ${isOpen ? "opacity-100" : "opacity-0"
                            }`}
                        style={{ color: "var(--text-muted)" }}
                    >
                        CHATS
                    </span>

                    <button
                        type="button"
                        onClick={isOpen ? onClose : onOpen}
                        className="hover:opacity-80"
                        style={{ color: "var(--text-muted)" }}
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
                            updateChatTitle={updateChatTitle}
                            loadingChats={loadingChats}
                            showHideButton={false}
                        />
                    </div>
                ) : (
                        <button

                            type="button"

                            onClick={onOpen}

                            className="flex-1 w-full flex items-center justify-center cursor-pointer transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03] group"

                            style={{ background: "transparent" }}

                            aria-label="Open sidebar"

                            title="Open sidebar"

                        >

                            <span

                                className="text-[10px] font-semibold tracking-widest rotate-90 select-none transition-opacity group-hover:opacity-100"

                                style={{ color: "var(--text-primary)", opacity: 0.55 }}

                            >

                                CHATS

                            </span>

                        </button>
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
    updateChatTitle,
    loadingChats,
    showHideButton,
    onHide,
}) {
    const [chatToDelete, setChatToDelete] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const editInputRef = useRef(null);

    const canDeleteChats = totalChatsCount > 1;
    const isSearching = searchQuery.trim().length > 0;

    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingId]);

    const startEdit = (chat) => {
        setEditingId(chat.id);
        setEditValue(chat.title || "New Chat");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue("");
    };

    const commitEdit = () => {
        const trimmed = editValue.trim();
        const currentChat = chats.find((c) => c.id === editingId);

        if (trimmed && currentChat && trimmed !== currentChat.title) {
            updateChatTitle(editingId, trimmed);
        }

        setEditingId(null);
        setEditValue("");
    };

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
                className="m-3 p-2 rounded text-sm hover:opacity-80 transition-opacity"
                type="button"
                style={{
                    background: "var(--bg-button)",
                    color: "var(--text-primary)",
                }}
            >
                + New Chat
            </button>

            <div className="mx-3 mb-3">
                <div
                    className="flex items-center rounded-lg border px-2"
                    style={{
                        borderColor: "var(--border-subtle)",
                        background: "var(--bg-input)",
                    }}
                >
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search chats..."
                        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
                        style={{ color: "var(--text-primary)" }}
                    />

                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="text-xs hover:opacity-80"
                            style={{ color: "var(--text-muted)" }}
                            aria-label="Clear search"
                            title="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto sleek-scrollbar">
                {loadingChats && <SidebarChatSkeleton />}

                {!loadingChats && chats.length === 0 && (
                    <div
                        className="px-3 py-2 text-xs"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {isSearching
                            ? "No matching chats found."
                            : "No chats yet. Create one."}
                    </div>
                )}

                {chats.map((chat) => {
                    const isActive = chat.id === activeChatId;
                    return (
                        <div
                            key={chat.id}
                            onClick={() => {
                                if (editingId !== chat.id) {
                                    setActiveChatId(chat.id);
                                }
                            }}
                            onDoubleClick={() => startEdit(chat)}
                            className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer transition-colors"
                            style={{
                                background: isActive ? "var(--bg-active)" : "transparent",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.background = "var(--bg-hover)";
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.background = "transparent";
                            }}
                        >
                            {editingId === chat.id ? (
                                <input
                                    ref={editInputRef}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") commitEdit();
                                        if (e.key === "Escape") cancelEdit();
                                    }}
                                    onBlur={commitEdit}
                                    maxLength={60}
                                    className="min-w-0 flex-1 rounded px-2 py-1 text-sm outline-none border"
                                    style={{
                                        background: "var(--bg-input)",
                                        color: "var(--text-primary)",
                                        borderColor: "var(--border-strong)",
                                    }}
                                />
                            ) : (
                                <span
                                    className="min-w-0 flex-1 truncate text-sm"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {chat.title || "New Chat"}
                                </span>
                            )}

                            {editingId !== chat.id && (
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startEdit(chat);
                                        }}
                                        className="hover:opacity-80 cursor-pointer"
                                        style={{ color: "var(--text-muted)" }}
                                        aria-label="Rename chat"
                                        title="Rename"
                                    >
                                        <FiEdit2 size={14} />
                                    </button>

                                    <button
                                        type="button"
                                        disabled={!canDeleteChats}
                                        className={canDeleteChats ? "cursor-pointer" : "cursor-not-allowed opacity-40"}
                                        style={{
                                            color: canDeleteChats
                                                ? "var(--text-muted)"
                                                : "var(--text-faint)",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (canDeleteChats)
                                                e.currentTarget.style.color = "var(--accent-danger)";
                                        }}
                                        onMouseLeave={(e) => {
                                            if (canDeleteChats)
                                                e.currentTarget.style.color = "var(--text-muted)";
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!canDeleteChats) return;
                                            setChatToDelete(chat);
                                        }}
                                        aria-label={canDeleteChats ? "Delete chat" : "Cannot delete the last chat"}
                                        title={canDeleteChats ? "Delete chat" : "At least one chat is required"}
                                    >
                                        <IoMdCloseCircle />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {showHideButton && (
                <button
                    className="m-3 p-2 rounded text-sm hover:opacity-80"
                    type="button"
                    onClick={onHide}
                    style={{
                        background: "var(--bg-button)",
                        color: "var(--text-primary)",
                    }}
                >
                    Hide Sidebar
                </button>
            )}

            {chatToDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ background: "var(--bg-modal-overlay)" }}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl"
                        style={{
                            background: "var(--bg-modal)",
                            borderColor: "var(--border-subtle)",
                        }}
                    >
                        <div
                            className="mb-2 text-base font-semibold"
                            style={{ color: "var(--text-primary)" }}
                        >
                            Delete chat?
                        </div>

                        <p
                            className="mb-4 text-sm"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Are you sure you want to delete{" "}
                            <span style={{ color: "var(--text-primary)" }}>
                                "{chatToDelete.title || "New Chat"}"
                            </span>
                            ? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setChatToDelete(null)}
                                className="rounded-lg px-3 py-2 text-sm hover:opacity-80"
                                style={{
                                    background: "var(--bg-button)",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                                style={{ background: "var(--accent-danger)" }}
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