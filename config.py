

import os


class Config:
   
    # SECRET_KEY signs the session cookie (it's how the app remembers who is
    SECRET_KEY = os.environ.get("SECRET_KEY", "lifelink-dev-secret-change-me")

    #  Database 
    # "sqlite:///lifelink.db" tells SQLAlchemy to use SQLite and save the data
   
    SQLALCHEMY_DATABASE_URI = "sqlite:///lifelink.db"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
