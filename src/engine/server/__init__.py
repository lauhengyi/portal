"""Set up the Flask app and import the routes."""
import os
import atexit
import threading
import time

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from flask import Flask
from flask_socketio import SocketIO

# pylint: disable=E0401, E0611
from server.services.global_store import GlobalStore

# Environment constants

os.environ["WERKZEUG_RUN_MAIN"] = "true"
MODEL_LOAD_LIMIT = 1
CACHE_OPTION = True
EPSILON_MULTIPLIER = 0.001
IDLE_MINUTES = 60 * 5
try:
    DEBUG_MODE = (
        int(os.environ["PORTAL_LOGGING"])
        if "PORTAL_LOGGING" in os.environ
        else None
    )
except ValueError as e:
    raise ValueError(
        "invalid literal for PORTAL_LOGGING variable.\n"
        "Only 1, 2, 3, 4, 5 are accepted."
    ) from e
if DEBUG_MODE is not None:
    # pylint: disable=wrong-import-position
    import logging

    # Logging Levels:
    # CRITICAL = 5
    # ERROR = 4
    # WARNING = 3
    # INFO = 2
    # DEBUG = 1
    try:
        logging.basicConfig(level=DEBUG_MODE * 10)
        logger = logging.getLogger(__name__)
    except ValueError as e:
        raise ValueError(
            "invalid literal for PORTAL_LOGGING variable.\n"
            "Only 1, 2, 3, 4, 5 are accepted."
        ) from e
else:
    logger = None


class ServerThread(threading.Thread):
    """
    This is a server thread that is linked to the flask app.
    """

    # pylint: disable=redefined-outer-name
    def __init__(self, app):
        """Initialise apps with CORS and run it."""

        threading.Thread.__init__(self)
        self.socket = SocketIO(
            app,
            async_mode="threading",
            cors_allowed_origins="*",
            use_debugger=False,
            use_reloader=False,
        )

    def run(self):
        self.socket.run(app, use_debugger=False, use_reloader=False, port=9449)


# pylint: disable=invalid-name
app = Flask(__name__)
server = ServerThread(app)
global_store = GlobalStore(MODEL_LOAD_LIMIT, caching_system=CACHE_OPTION)
scheduler = BackgroundScheduler(daemon=True)


def wait_for_process() -> None:
    """Wait for the previous atomic function to be completed."""
    while global_store.get_atomic():
        time.sleep(0.1)


def shutdown_server() -> None:
    """Shutdown the server."""
    os._exit(0)  # pylint: disable=W0212


def schedule_shutdown():
    """Scheduler Job to check whether there's inactivity within the last 5 minutes

    :return: void
    """
    if (
        global_store.is_shutdown_server(IDLE_MINUTES)
        or global_store.get_atomic()
    ):
        time.sleep(5)
    else:
        shutdown_server()


scheduler.add_job(schedule_shutdown, IntervalTrigger(minutes=1))
scheduler.start()
# Shut down the scheduler when exiting the app
# pylint: disable=unnecessary-lambda)
atexit.register(lambda: scheduler.shutdown())

# pylint: disable=wrong-import-position
from .routes import routes
