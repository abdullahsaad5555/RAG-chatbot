import logging
import sys


def setup_logging(log_level: str = "INFO") -> None:
    """
    Central logging configuration
    Call once at app startup or script entry
    """

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ],
    )


def get_logger(name: str) -> logging.Logger:
    """
    Get a named logger
    """
    return logging.getLogger(name)