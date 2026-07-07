

from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, logout_user, current_user

from extensions import db
from models import Donation

user_bp = Blueprint("user", __name__)



#  view profile + donation history

@user_bp.route("/profile")
@login_required
def profile():
    # the donations this user has made (READ via the relationship)
    history = current_user.donations_made
    return render_template("profile.html", user=current_user, history=history)


#  update
@user_bp.route("/profile/update", methods=["POST"])
@login_required
def update_profile():
    # change the fields directly on the current_user object...
    current_user.full_name = request.form.get("full_name", current_user.full_name).strip()
    current_user.phone = request.form.get("phone", current_user.phone)
    current_user.city = request.form.get("city", current_user.city)
    current_user.blood_type = request.form.get("blood_type", current_user.blood_type)

    # ...then commit. SQLAlchemy turns this into an SQL UPDATE automatically.
    db.session.commit()
    flash("Profile updated.", "success")
    return redirect(url_for("user.profile"))



# DELETE

@user_bp.route("/profile/delete", methods=["POST"])
@login_required
def delete_account():
    user = current_user._get_current_object() 
    logout_user()                              
    db.session.delete(user)                   
    db.session.commit()
    flash("Your account has been deleted.", "success")
    return redirect(url_for("auth.signup"))