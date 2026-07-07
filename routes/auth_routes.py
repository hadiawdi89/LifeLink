

from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user

from extensions import db
from models import User

auth = Blueprint("auth", __name__)


@auth.route("/signup", methods=["GET", "POST"])
def signup():
    # Someone already logged in has no reason to be here.
    if current_user.is_authenticated:
        return redirect(url_for("user.profile"))

    if request.method == "POST":
        full_name = request.form.get("full_name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        blood_type = request.form.get("blood_type", "")
        city = request.form.get("city", "")
        phone = request.form.get("phone", "")

        # The three fields the form marks as required.
        if not full_name or not email or not password:
            flash("Name, email and password are required.", "error")
            return redirect(url_for("auth.signup"))

        # Email must be unique — one account per email.
        if User.query.filter_by(email=email).first():
            flash("An account with that email already exists.", "error")
            return redirect(url_for("auth.signup"))

        # Every member is both a donor and a receiver, so both flags are True.
        # is_admin is always False here — admins are created elsewhere.
        user = User(
            full_name=full_name, email=email,
            blood_type=blood_type, city=city, phone=phone,
            is_donor=True, is_receiver=True, is_admin=False,
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        # Log them in right away, then send them to their profile.
        login_user(user)
        flash("Welcome to LifeLink, " + full_name + "!", "success")
        return redirect(url_for("user.profile"))

    # GET request: just show the empty sign-up form.
    return render_template("signup.html")


@auth.route("/login", methods=["GET", "POST"])
def login():
    # Already logged in? Skip the login page.
    if current_user.is_authenticated:
        return redirect(url_for("user.profile"))

    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        remember = request.form.get("remember") == "on"

        # Look up the user, then check the password.
        # We use one generic message so we don't reveal which part was wrong.
        user = User.query.filter_by(email=email).first()
        if user is None or not user.check_password(password):
            flash("Wrong email or password.", "error")
            return redirect(url_for("auth.login"))

        login_user(user, remember=remember)
        flash("Logged in successfully.", "success")

        # Admins go to the admin dashboard; everyone else to their profile.
        if user.is_admin:
            return redirect(url_for("admin.dashboard"))
        return redirect(url_for("user.profile"))

    # GET request: show the login form.
    return render_template("login.html")


@auth.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have been logged out.", "success")
    return redirect(url_for("auth.login"))
