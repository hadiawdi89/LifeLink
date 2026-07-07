from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from extensions import db
from models import DonationRequest

from datetime import timezone
# Asia/Beirut is the Lebanon time zone. It automatically knows about
# summer time (UTC+3) and winter time (UTC+2), so we never hard-code an offset.
try:
    from zoneinfo import ZoneInfo
    _BEIRUT = ZoneInfo("Asia/Beirut")
except Exception:
    # If the time-zone database is missing we just show the stored time
    # instead of crashing the page. (On Windows run: pip install tzdata)
    _BEIRUT = None


def to_beirut_time(dt):
    """Take a time saved in UTC and return it as Lebanon local time,
    formatted like '2026-06-13 14:30'."""
    if dt is None:
        return ""
    if _BEIRUT is None:
        return dt.strftime("%Y-%m-%d %H:%M")
    # The database stores times in UTC (datetime.utcnow), so we first label
    # the time as UTC, then convert it to Lebanon time.
    utc_time = dt.replace(tzinfo=timezone.utc)
    local_time = utc_time.astimezone(_BEIRUT)
    return local_time.strftime("%Y-%m-%d %H:%M")

request_bp = Blueprint("request", __name__)

@request_bp.route("/send-request", methods=["POST"])
@login_required
def send_request():
    # The find-donor form sends these three fields with a normal POST.
    donor_id = request.form.get("donor_id")
    blood_type = request.form.get("blood_type")
    message = request.form.get("message", "")

    # If the important fields are missing, go back with an error message.
    if not donor_id or not blood_type:
        flash("Could not send the request. Please try again.", "error")
        return redirect(url_for("pages.find_donor"))

    from models import User
    donor = User.query.get(donor_id)
    if not donor or not donor.is_donor:
        flash("That donor could not be found.", "error")
        return redirect(url_for("pages.find_donor"))

    # Save the new request in the database.
    new_request = DonationRequest(
        sender_id=current_user.id,
        donor_id=donor.id,
        blood_type=blood_type,
        message=message
    )
    db.session.add(new_request)
    db.session.commit()

    # Show a success message on the find-donor page.
    flash("Your request was sent to " + donor.full_name + ". They will be notified.", "success")
    return redirect(url_for("pages.find_donor"))

@request_bp.route("/my-requests")
@login_required
def my_requests():
    pending = DonationRequest.query.filter_by(donor_id=current_user.id, status="pending").all()
    history = DonationRequest.query.filter(
        (DonationRequest.donor_id == current_user.id) | (DonationRequest.sender_id == current_user.id)
    ).order_by(DonationRequest.created_at.desc()).all()

    # Give each request a ready-to-show Lebanon-time string for the template.
    for req in pending:
        req.local_time = to_beirut_time(req.created_at)
    for req in history:
        req.local_time = to_beirut_time(req.created_at)

    return render_template("my_requests.html", pending=pending, history=history)

@request_bp.route("/approve-request/<int:req_id>", methods=["POST"])
@login_required
def approve_request(req_id):
    req = DonationRequest.query.get_or_404(req_id)
    if req.donor_id != current_user.id:
        flash("Not authorized", "error")
        return redirect(url_for("request.my_requests"))
    req.status = "approved"
    db.session.commit()
    flash("Request approved.", "success")
    return redirect(url_for("request.my_requests"))

@request_bp.route("/reject-request/<int:req_id>", methods=["POST"])
@login_required
def reject_request(req_id):
    req = DonationRequest.query.get_or_404(req_id)
    if req.donor_id != current_user.id:
        flash("Not authorized", "error")
        return redirect(url_for("request.my_requests"))
    req.status = "rejected"
    db.session.commit()
    flash("Request rejected.", "success")
    return redirect(url_for("request.my_requests"))
