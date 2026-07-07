

from flask import Blueprint, render_template, request, redirect, url_for, flash
from sqlalchemy import func

from extensions import db
from models import User, Donation
from decorators.admin_required import admin_required

admin = Blueprint("admin", __name__, url_prefix="/admin")


@admin.route("/")
@admin_required
def dashboard():
    stats = {
        "donors": User.query.filter_by(is_donor=True).count(),
        "receivers": User.query.filter_by(is_receiver=True).count(),
        "admins": User.query.filter_by(is_admin=True).count(),
    }
    return render_template("admin_dashboard.html", stats=stats)


@admin.route("/users")
@admin_required
def users():
    all_users = User.query.order_by(User.created_at.desc()).all()
    return render_template("admin_users.html", users=all_users)


@admin.route("/users/create", methods=["POST"])
@admin_required
def create_user():
    full_name = request.form.get("full_name", "").strip()
    email = request.form.get("email", "").strip().lower()
    password = request.form.get("password", "")
    blood_type = request.form.get("blood_type", "")
    city = request.form.get("city", "")
    role = request.form.get("role", "")

    if not full_name or not email or not password:
        flash("Name, email and password are required.", "error")
        return redirect(url_for("admin.users"))
    if User.query.filter_by(email=email).first():
        flash("That email is already in use.", "error")
        return redirect(url_for("admin.users"))

    # Set boolean flags based on role
    is_donor = (role == "donor")
    is_receiver = (role == "receiver")
    is_admin = (role == "admin")

    # Default to donor if nothing selected (should not happen with dropdown)
    if not (is_donor or is_receiver or is_admin):
        is_donor = True

    user = User(
        full_name=full_name, email=email, blood_type=blood_type, city=city,
        is_donor=is_donor, is_receiver=is_receiver, is_admin=is_admin
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    flash("User created.", "success")
    return redirect(url_for("admin.users"))


@admin.route("/users/<int:user_id>/delete", methods=["POST"])
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    flash("User deleted.", "success")
    return redirect(url_for("admin.users"))




@admin.route("/statistics")
@admin_required
def statistics():
    rows = (
        db.session.query(User.blood_type, func.count(User.id))
        .filter(User.is_donor == True)
        .group_by(User.blood_type)
        .all()
    )
    all_types = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]
    counts = {t: 0 for t in all_types}
    for blood_type, count in rows:
        if blood_type in counts:
            counts[blood_type] = count
    return render_template("admin_statistics.html", counts=counts)


#  donation request mangment (admin) 
@admin.route("/donation-requests")
@admin_required
def donation_requests():
    """List all donation requests (user-to-user) for admin oversight."""
    from models import DonationRequest
    all_requests = DonationRequest.query.order_by(DonationRequest.created_at.desc()).all()
    return render_template("admin_donation_requests.html", requests=all_requests)


@admin.route("/donation-requests/<int:req_id>/<action>", methods=["POST"])
@admin_required
def handle_donation_request(req_id, action):
    """Admin approves or rejects a donation request."""
    from models import DonationRequest
    req = DonationRequest.query.get_or_404(req_id)
    if action == "approve":
        req.status = "approved"
        flash(f"Donation request #{req.id} approved.", "success")
    elif action == "reject":
        req.status = "rejected"
        flash(f"Donation request #{req.id} rejected.", "success")
    else:
        flash("Invalid action.", "error")
        return redirect(url_for("admin.donation_requests"))
    db.session.commit()
    return redirect(url_for("admin.donation_requests"))