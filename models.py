

from datetime import datetime

from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

from extensions import db


# model 1  user

class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(40))
    blood_type = db.Column(db.String(4))           
    city = db.Column(db.String(60))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    #  roles 

    is_donor = db.Column(db.Boolean, default=False)
    is_receiver = db.Column(db.Boolean, default=False)
    is_admin = db.Column(db.Boolean, default=False)

    # donor-profile columns (shown on the Find-Donor page) 
    availability = db.Column(db.String(40))               
    status = db.Column(db.String(20), default="available")  
    is_rapid = db.Column(db.Boolean, default=False)       
    avg_response_min = db.Column(db.Integer, default=15)    
    total_donations = db.Column(db.Integer, default=0)
    last_donation_date = db.Column(db.Date)                 

    #  relationships (donations only) 
    donations_made = db.relationship(
        "Donation",
        foreign_keys="Donation.donor_id",
        back_populates="donor",
        cascade="all, delete-orphan",
    )
   

    #  password methods 
    def set_password(self, raw_password):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password_hash, raw_password)

    #  a readable label like "Donor & Receiver" for templates 
    def roles_label(self):
        roles = []
        if self.is_admin:
            roles.append("Admin")
        if self.is_donor:
            roles.append("Donor")
        if self.is_receiver:
            roles.append("Receiver")
        return " & ".join(roles) if roles else "User"

    def days_since_last_donation(self):
        """Days since this donor last gave blood (0 if never)."""
        if not self.last_donation_date:
            return 0
        return (datetime.utcnow().date() - self.last_donation_date).days

    def __repr__(self):
        return "<User " + self.email + " (" + self.roles_label() + ")>"

    
    
class DonationRequest(db.Model):
    __tablename__ = "donation_requests"
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    donor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    blood_type = db.Column(db.String(4), nullable=False)
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sender = db.relationship("User", foreign_keys=[sender_id], backref="sent_requests")
    donor = db.relationship("User", foreign_keys=[donor_id], backref="received_requests")

# MODEL 2 — DONATION

class Donation(db.Model):
    __tablename__ = "donations"

    id = db.Column(db.Integer, primary_key=True)
    donor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    blood_type = db.Column(db.String(4))
    donation_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default="pending")  

    donor = db.relationship("User", foreign_keys=[donor_id], back_populates="donations_made")
   

    def __repr__(self):
        return "<Donation #" + str(self.id) + " " + str(self.blood_type) + " " + self.status + ">"
