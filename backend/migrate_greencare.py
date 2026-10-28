"""Apply additive GreenCare schema changes without dropping existing data."""
from sqlalchemy import inspect, text

from app.database import Base, engine
from app import models  # noqa: F401 - register model metadata


def apply_migrations() -> None:
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        inspector = inspect(connection)
        user_columns = {column["name"] for column in inspector.get_columns("users")}
        if "is_verified" not in user_columns:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE")
            )

        reminder_columns = {
            column["name"] for column in inspect(connection).get_columns("reminders")
        }
        if "recurrence" not in reminder_columns:
            connection.execute(
                text(
                    "ALTER TABLE reminders ADD COLUMN recurrence "
                    "VARCHAR(20) NOT NULL DEFAULT 'none'"
                )
            )


if __name__ == "__main__":
    apply_migrations()
    print("GreenCare additive schema migrations applied.")
