

from datetime import datetime

from flask import Blueprint, request, redirect, url_for, flash
from flask_login import login_required, current_user

from extensions import db
from models import Donation

donation_bp = Blueprint("donation", __name__)


# CREATE — a donor logs that they donated

@donation_bp.route("/donations/add", methods=["POST"])
@login_required
def add_donation():
    # If the form leaves blood type empty, fall back to the donor's own type.
    blood_type = request.form.get("blood_type") or current_user.blood_type

    donation = Donation(
        donor_id=current_user.id,
        blood_type=blood_type,
        donation_date=datetime.utcnow(),
        status="pending",
    )
    db.session.add(donation)

    # keep the donor's running total in sync
    current_user.total_donations = (current_user.total_donations or 0) + 1
    current_user.last_donation_date = datetime.utcnow().date()

    db.session.commit()
    flash("Donation recorded — thank you!", "success")
    return redirect(url_for("user.profile"))


# 
# UPDATE — change a donation's status (donor can mark their own completed)
# Triggered by the "Mark completed" button on the profile page.
# 
@donation_bp.route("/donations/<int:donation_id>/status", methods=["POST"])
@login_required
def update_status(donation_id):
    donation = Donation.query.get_or_404(donation_id)

    # a donor may only edit their own donations (admins may edit any)
    if donation.donor_id != current_user.id and not current_user.is_admin:
        flash("You cannot change that donation.", "error")
        return redirect(url_for("user.profile"))

    new_status = request.form.get("status", "")
    if new_status in ("pending", "approved", "completed"):
        donation.status = new_status
        db.session.commit()
        flash("Donation status updated.", "success")

    return redirect(url_for("user.profile"))
