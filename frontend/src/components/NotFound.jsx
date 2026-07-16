import { Link } from "react-router-dom";
import { FiAlertCircle, FiHome } from "react-icons/fi";

export default function NotFound() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
            <div className="relative">
                <div className="absolute inset-0 blur-3xl scale-150 bg-gradient-to-tr from-red-500/20 via-orange-500/20 to-yellow-400/20" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
                    <FiAlertCircle className="h-10 w-10 text-white/70" />
                </div>
            </div>

            <div>
                <h1 className="text-4xl font-medium text-white/90">404</h1>
                <p className="mt-2 text-lg text-white/60">
                    Page not found
                </p>
                <p className="mt-1 max-w-md text-sm text-white/40">
                    The link you followed may be broken, or the page may have been removed.
                </p>
            </div>

            <Link
                to="/"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.08] transition-colors"
            >
                <FiHome size={14} />
                Back to Home
            </Link>
        </div>
    );
}