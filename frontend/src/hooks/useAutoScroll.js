import { useEffect } from "react";

export default function useAutoScroll(bottomRef, deps) {
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, deps); // caller controls dependency list
}