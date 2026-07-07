

from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

# The database object Models will inherit from db.Model
db = SQLAlchemy()

# The Flask-Login manager It handles sessions, cookies, and current user
login_manager = LoginManager()

# If a not-logged-in user opens a protected page  send them to the login route
login_manager.login_view = "auth.login"
login_manager.login_message = "Please log in to continue."
