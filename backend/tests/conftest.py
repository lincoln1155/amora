import os
import tempfile

# Set env vars before any app modules are imported.
_tmp_db_fd, _tmp_db_path = tempfile.mkstemp(suffix=".db")
os.close(_tmp_db_fd)

os.environ["APP_PASSWORD"] = "test_password"
os.environ["SECRET_KEY"] = "test_secret_key"
os.environ["WEATHER_API_KEY"] = ""
os.environ["DEFAULT_CITY"] = "Test City"
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp_db_path}"
os.environ["IS_PRODUCTION"] = "0"

# Pre-create tables. The TestClient does not always trigger @app.on_event("startup"),
# so we initialize the schema explicitly to keep tests deterministic.
from app.database import create_db  # noqa: E402

create_db()
