

from flask import Blueprint, render_template

from models import User, Donation

pages = Blueprint("pages", __name__)


@pages.route("/")
def index():
    stats = {
        "donors": User.query.filter_by(is_donor=True).count(),
        "receivers": User.query.filter_by(is_receiver=True).count(),
        "donations": Donation.query.count(),
        "members": User.query.count(),
    }
    return render_template("index.html", stats=stats)


@pages.route("/find-donor")
def find_donor():
    donors = User.query.filter_by(is_donor=True).all()
    return render_template("find-donor.html", donors=donors)


@pages.route("/dashboard")
def dashboard():
    """Public analytics dashboard with donor stats."""
    donors_total = User.query.filter_by(is_donor=True).count()
    available_now = User.query.filter_by(is_donor=True, status="available").count()
    total_donations = Donation.query.count()

    stats = {
        "donors": donors_total,
        "available": available_now,
        "donations": total_donations,
    }

    # Percentage of registered donors who are available right now.
    # The "if" guard avoids dividing by zero when there are no donors yet.
    available_pct = 0
    if donors_total > 0:
        available_pct = round(available_now / donors_total * 100)

    return render_template("dashboard.html", stats=stats, available_pct=available_pct)


@pages.route("/contact")
def contact():
    return render_template("contact.html")