import threading
from pathlib import Path

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from app.ingestion.pipeline import RAW_DIR, rebuild_index


DEBOUNCE_SECONDS = 5
WATCHED_EVENTS = {"created", "modified", "deleted", "moved"}


class _RawFolderHandler(FileSystemEventHandler):
    def __init__(self):
        self._timer = None
        self._timer_lock = threading.Lock()

    def on_any_event(self, event):
        if event.is_directory or event.event_type not in WATCHED_EVENTS:
            return

        name = Path(event.src_path).name
        if name.startswith((".", "~$")):
            return

        # Wait until changes stop (e.g. copying several files), then rebuild once
        with self._timer_lock:
            if self._timer:
                self._timer.cancel()
            self._timer = threading.Timer(DEBOUNCE_SECONDS, self._rebuild)
            self._timer.daemon = True
            self._timer.start()

    def _rebuild(self):
        try:
            rebuild_index()
        except Exception as exc:
            print(f"Index rebuild failed: {exc}")


def start_watcher():
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    observer = Observer()
    observer.schedule(_RawFolderHandler(), str(RAW_DIR), recursive=True)
    observer.daemon = True
    observer.start()

    print(f"Watching {RAW_DIR} for document changes")
    return observer