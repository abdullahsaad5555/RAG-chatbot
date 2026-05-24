from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from settings import settings


connect_args = {}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {}
elif settings.DATABASE_URL.startswith("postgresql"):
    connect_args = {
        "ssl": "require",
        "timeout": 30,
    }


engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    connect_args=connect_args,
)

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    async with SessionLocal() as session:
        yield session