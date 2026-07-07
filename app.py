

import os
from flask import Flask, render_template

from config import Config
from extensions import db, login_manager


from models import User


from routes.auth_routes import auth
from routes.user_routes import user_bp
from routes.admin_routes import admin
from routes.donation_routes import donation_bp
from routes.pages_routes import pages
from routes import request_routes


def create_app():
   
    app = Flask(__name__)
    app.config.from_object(Config)

    #connect the extensions to this app 
    db.init_app(app)
    login_manager.init_app(app)

    #  Flask-Login: how to load a user from the id stored in the session 
    @login_manager.user_loader
    def load_user(user_id):
       
        return db.session.get(User, int(user_id))

    #  register all the route groups 
    app.register_blueprint(pages)               
    app.register_blueprint(auth)               
    app.register_blueprint(user_bp)             
    app.register_blueprint(admin)               
    app.register_blueprint(donation_bp)        
    app.register_blueprint(request_routes.request_bp)  

   
    @app.errorhandler(403)
    def forbidden(_e):
        return render_template("403.html"), 403

    @app.errorhandler(404)
    def not_found(_e):
        return render_template("404.html"), 404

    @app.errorhandler(500)
    def server_error(_e):
        return render_template("500.html"), 500

    # create tables and create first admin account (only if empty) 
    with app.app_context():
        db.create_all()
        _create_first_admin()

    return app


def _create_first_admin():
   
    if User.query.first() is not None:
        return  

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@lifelink.lb")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")

    admin_user = User(
        full_name="Site Admin",
        email=admin_email,
        city="Beirut",
        is_admin=True,
        is_donor=False,
        is_receiver=False
    )
    admin_user.set_password(admin_password)
    db.session.add(admin_user)
    db.session.commit()
    print(f"✅ Created admin account: {admin_email} (password: {admin_password})")



app = create_app()

if __name__ == "__main__":
    
    app.run(debug=True)