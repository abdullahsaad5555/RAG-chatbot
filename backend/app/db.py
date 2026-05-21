from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.settings import settings

# Engine created once; connection pooling handled here (scales later) [2](https://deepwiki.com/modern-python/fastapi-sqlalchemy-template/5.2-sessions-and-connections)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,   # helps avoid stale connections [2](https://deepwiki.com/modern-python/fastapi-sqlalchemy-template/5.2-sessions-and-connections)
)

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db() -> AsyncSession:
    async with SessionLocal() as session:
        yield session