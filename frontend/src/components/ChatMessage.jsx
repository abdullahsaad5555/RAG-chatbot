import { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import toast from "react-hot-toast";
import TypingIndicator from "./TypingIndicator";

export default function ChatMessage({ message }) {
    const isUser = message.role === "user";
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            toast.success("Copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            toast.error("Failed to copy");
            console.error(e);
        }
    };

    const canCopy = !message.typing && message.content;

    return (
        <div className={`group flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className="flex max-w-[85%] flex-col gap-1">
                <div
                    className="rounded-2xl px-4 py-2 text-sm"
                    style={{
                        background: isUser ? "var(--user-bubble-bg)" : "var(--bot-bubble-bg)",
                        color: isUser ? "var(--user-bubble-text)" : "var(--bot-bubble-text)",
                    }}
                >
                    {message.typing ? (
                        <TypingIndicator />
                    ) : isUser ? (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                    ) : (
                        <div className="markdown-body prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                                components={{
                                    a: ({ node, ...props }) => (
                                        <a
                                            {...props}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: "var(--accent-primary)" }}
                                            className="underline hover:opacity-80"
                                        />
                                    ),
                                    code: ({ inline, className, children, ...props }) =>
                                        inline ? (
                                            <code
                                                className="rounded px-1 py-0.5 text-[13px]"
                                                style={{ background: "var(--code-inline-bg)" }}
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        ) : (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        ),
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                <div
                    className={`flex items-center gap-2 px-1 text-[10px] ${isUser ? "justify-end" : "justify-start"
                        }`}
                    style={{ color: "var(--text-faint)" }}
                >
                    <span>{isUser ? "You" : "YasrefAI"}</span>

                    {canCopy && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-100"
                            style={{ color: "var(--text-muted)" }}
                            aria-label="Copy message"
                            title={copied ? "Copied!" : "Copy"}
                        >
                            {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}