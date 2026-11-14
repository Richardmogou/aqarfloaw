from datetime import datetime, timedelta, timezone
from decimal import Decimal
import argparse
import getpass
import re
import sys

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.core.security import hash_password
from app.models import Activity, Agency, Contact, Deal, DealEvent, Lead, Property, User, Visit
from app.permissions.roles import Role
from app.services.phone import normalize_phone

MIN_PASSWORD_LENGTH = 12


def agency_slug(agency_name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", agency_name.lower()).strip("-")


def create_user(db: Session, agency: Agency, email: str, full_name: str, password: str, role: Role) -> None:
    email = email.strip().lower()
    if db.scalar(select(User).where(User.email == email)):
        sys.exit(f"A user with email {email} already exists.")
    db.add(User(agency_id=agency.id, full_name=full_name, email=email,
                password_hash=hash_password(password), role=role.value))
    db.commit()
    print(f"{role.value.capitalize()} {email} created for agency '{agency.name}' ({agency.slug}).")


def create_admin(agency_name: str, email: str, full_name: str, password: str) -> None:
    slug = agency_slug(agency_name)
    with SessionLocal() as db:
        agency = db.scalar(select(Agency).where(Agency.slug == slug)) or Agency(name=agency_name, slug=slug)
        db.add(agency)
        db.flush()
        create_user(db, agency, email, full_name, password, Role.ADMIN)


def create_agent(agency_name: str, email: str, full_name: str, password: str) -> None:
    slug = agency_slug(agency_name)
    with SessionLocal() as db:
        agency = db.scalar(select(Agency).where(Agency.slug == slug))
        if agency is None:
            known = ", ".join(db.scalars(select(Agency.name)).all()) or "none"
            sys.exit(f"Agency '{agency_name}' does not exist. Known agencies: {known}. Run create-admin first.")
        create_user(db, agency, email, full_name, password, Role.AGENT)


def get_or_create_user(db: Session, agency: Agency, email: str, full_name: str, password_hash: str, role: Role) -> User:
    user = db.scalar(select(User).where(User.email == email))
    if user is None:
        user = User(
            agency_id=agency.id,
            full_name=full_name,
            email=email,
            password_hash=password_hash,
            role=role.value,
            is_active=True,
        )
        db.add(user)
        db.flush()
    return user


def seed_demo_data(db: Session, password: str = "AqarFlowDemo!2026") -> dict[str, int]:
    slug = "islamabad-capital-towers"
    agency = db.scalar(select(Agency).where(Agency.slug == slug))
    if agency is None:
        agency = Agency(name="Islamabad Capital Towers", slug=slug, default_currency="PKR")
        db.add(agency)
        db.flush()

    pw_hash = hash_password(password)
    admin = get_or_create_user(db, agency, "admin@aqarflow.pk", "Ayesha Khan", pw_hash, Role.ADMIN)
    agent1 = get_or_create_user(db, agency, "usman.riaz@aqarflow.pk", "Usman Riaz", pw_hash, Role.AGENT)
    agent2 = get_or_create_user(db, agency, "zainab.baloch@aqarflow.pk", "Zainab Baloch", pw_hash, Role.AGENT)

    prop_specs = [
        {
            "reference_code": "ISB-DUP-001",
            "slug": "panoramic-margalla-view-duplex-penthouse-f7-isb-dup-001",
            "title": "Panoramic Margalla View Duplex Penthouse in F-7",
            "description": "Double-height duplex penthouse overlooking the Margalla Hills with private elevator lobby and rooftop terrace.",
            "purpose": "sale",
            "property_type": "apartment",
            "price": Decimal("185000000"),
            "area_value": Decimal("445"),
            "area_unit": "sqm",
            "bedrooms": 4,
            "bathrooms": 5,
            "address": "Margalla Road, Sector F-7/2",
            "city": "Islamabad",
            "locality": "Sector F-7/2",
            "status": "available",
            "is_published": True,
            "assigned_agent_id": agent1.id,
        },
        {
            "reference_code": "ISB-VIL-002",
            "slug": "ambassadorial-2-kanal-villa-f6-isb-vil-002",
            "title": "Ambassadorial 2 Kanal Villa with Lush Garden",
            "description": "Diplomatic-grade residence in F-6/3 featuring formal reception halls, mature lawn, and staff quarters.",
            "purpose": "rent",
            "property_type": "villa",
            "price": Decimal("950000"),
            "area_value": Decimal("2"),
            "area_unit": "kanal",
            "bedrooms": 6,
            "bathrooms": 7,
            "address": "Street 14, Sector F-6/3",
            "city": "Islamabad",
            "locality": "Sector F-6/3",
            "status": "available",
            "is_published": True,
            "assigned_agent_id": agent1.id,
        },
        {
            "reference_code": "ISB-HOU-003",
            "slug": "brand-new-12-marla-modern-house-e11-isb-hou-003",
            "title": "Brand New 12 Marla Modern House in E-11/2",
            "description": "Contemporary family home with 15kW hybrid solar backup, basement home theater, and imported kitchen fittings.",
            "purpose": "sale",
            "property_type": "house",
            "price": Decimal("72000000"),
            "area_value": Decimal("12"),
            "area_unit": "marla",
            "bedrooms": 5,
            "bathrooms": 6,
            "address": "Street 9, Sector E-11/2",
            "city": "Islamabad",
            "locality": "Sector E-11/2",
            "status": "reserved",
            "is_published": True,
            "assigned_agent_id": agent2.id,
        },
        {
            "reference_code": "LHR-COM-004",
            "slug": "grade-a-corner-commercial-floor-gulberg-lhr-com-004",
            "title": "Grade-A Corner Commercial Floor on Main Boulevard Gulberg",
            "description": "Full floor plate suited for corporate headquarters with dedicated backup generators and executive parking bays.",
            "purpose": "sale",
            "property_type": "commercial",
            "price": Decimal("310000000"),
            "area_value": Decimal("575"),
            "area_unit": "sqm",
            "bedrooms": 0,
            "bathrooms": 4,
            "address": "Main Boulevard, Gulberg III",
            "city": "Lahore",
            "locality": "Gulberg III",
            "status": "draft",
            "is_published": False,
            "assigned_agent_id": agent2.id,
        },
    ]

    props: list[Property] = []
    for spec in prop_specs:
        prop = db.scalar(
            select(Property).where(
                Property.agency_id == agency.id,
                Property.reference_code == spec["reference_code"],
            )
        )
        if prop is None:
            prop = Property(agency_id=agency.id, **spec)
            db.add(prop)
            db.flush()
        props.append(prop)

    lead_specs = [
        {
            "name": "Bilal Siddiqui",
            "phone": "+92 300 5551122",
            "email": "bilal.siddiqui@example.com",
            "source": "website",
            "stage": "negotiation",
            "property": props[0],
            "agent": agent1,
            "budget_min": Decimal("165000000"),
            "budget_max": Decimal("190000000"),
            "preferred_location": "F-7, Islamabad",
            "message": "Interested in scheduling a private family viewing of the duplex penthouse.",
        },
        {
            "name": "Tariq Mahmood",
            "phone": "+92 300 4455667",
            "email": "tariq.mahmood@example.com",
            "source": "phone",
            "stage": "visit_scheduled",
            "property": props[1],
            "agent": agent1,
            "budget_min": Decimal("850000"),
            "budget_max": Decimal("1000000"),
            "preferred_location": "F-6/3, Islamabad",
            "message": "Looking for an ambassadorial residence with formal entertaining space.",
        },
        {
            "name": "Sana Javed",
            "phone": "+92 321 9988776",
            "email": "sana.javed@example.com",
            "source": "referral",
            "stage": "negotiation",
            "property": props[2],
            "agent": agent2,
            "budget_min": Decimal("65000000"),
            "budget_max": Decimal("75000000"),
            "preferred_location": "E-11/2, Islamabad",
            "message": "Referred by existing client; ready for immediate family move-in.",
        },
    ]

    leads: list[Lead] = []
    for lspec in lead_specs:
        norm = normalize_phone(lspec["phone"])
        contact = db.scalar(
            select(Contact).where(Contact.agency_id == agency.id, Contact.phone_normalized == norm)
        )
        if contact is None:
            contact = Contact(
                agency_id=agency.id,
                name=lspec["name"],
                phone=lspec["phone"],
                phone_normalized=norm,
                email=lspec["email"],
                contact_type="buyer",
            )
            db.add(contact)
            db.flush()

        lead = db.scalar(
            select(Lead).where(
                Lead.agency_id == agency.id,
                Lead.contact_id == contact.id,
                Lead.property_id == lspec["property"].id,
            )
        )
        if lead is None:
            lead = Lead(
                agency_id=agency.id,
                contact_id=contact.id,
                property_id=lspec["property"].id,
                source=lspec["source"],
                message=lspec["message"],
                budget_min=lspec["budget_min"],
                budget_max=lspec["budget_max"],
                preferred_location=lspec["preferred_location"],
                stage=lspec["stage"],
                assigned_agent_id=lspec["agent"].id,
            )
            db.add(lead)
            db.flush()
            db.add(Activity(
                agency_id=agency.id,
                related_type="lead",
                related_id=lead.id,
                user_id=admin.id,
                activity_type="note",
                body=f"Initial qualification completed for {lspec['name']}.",
            ))
        leads.append(lead)

    existing_visits = db.scalars(select(Visit).where(Visit.agency_id == agency.id)).all()
    if not existing_visits:
        now = datetime.now(timezone.utc)
        tomorrow_11 = (now + timedelta(days=1)).replace(hour=11, minute=0, second=0, microsecond=0)
        tomorrow_1130 = (now + timedelta(days=1)).replace(hour=11, minute=30, second=0, microsecond=0)
        yesterday_15 = (now - timedelta(days=1)).replace(hour=15, minute=0, second=0, microsecond=0)

        db.add_all([
            Visit(
                agency_id=agency.id,
                property_id=props[0].id,
                lead_id=leads[0].id,
                agent_id=agent1.id,
                starts_at=tomorrow_11,
                ends_at=tomorrow_11 + timedelta(minutes=60),
                status="confirmed",
                meeting_point="Tower B Concierge Desk, F-7 Markaz",
                notes="Private terrace inspection and floorplan walkthrough.",
            ),
            Visit(
                agency_id=agency.id,
                property_id=props[1].id,
                lead_id=leads[1].id,
                agent_id=agent1.id,
                starts_at=tomorrow_1130,
                ends_at=tomorrow_1130 + timedelta(minutes=60),
                status="requested",
                meeting_point="Main Gate, Street 14, F-6/3",
                notes="Client arriving with architect to review lawn and guest annex.",
            ),
            Visit(
                agency_id=agency.id,
                property_id=props[2].id,
                lead_id=leads[2].id,
                agent_id=agent2.id,
                starts_at=yesterday_15,
                ends_at=yesterday_15 + timedelta(minutes=45),
                status="completed",
                meeting_point="Property driveway, Street 9, E-11/2",
                outcome="Buyer loved the solar backup and basement suite. Moving to formal offer stage.",
            ),
        ])
        db.flush()

    existing_deals = db.scalars(select(Deal).where(Deal.agency_id == agency.id)).all()
    if not existing_deals:
        now = datetime.now(timezone.utc)
        d1 = Deal(
            agency_id=agency.id,
            property_id=props[0].id,
            lead_id=leads[0].id,
            buyer_contact_id=leads[0].contact_id,
            agent_id=agent1.id,
            stage="negotiation",
            offer_amount=Decimal("175000000"),
            agreed_amount=Decimal("180000000"),
            expected_close_date=now + timedelta(days=21),
            notes="Seller countered at PKR 180M including rooftop pergola fixtures.",
        )
        d2 = Deal(
            agency_id=agency.id,
            property_id=props[2].id,
            lead_id=leads[2].id,
            buyer_contact_id=leads[2].contact_id,
            agent_id=agent2.id,
            stage="booking",
            offer_amount=Decimal("70000000"),
            agreed_amount=Decimal("71000000"),
            expected_close_date=now + timedelta(days=14),
            notes="10% token money received; CDA transfer application scheduled.",
        )
        db.add_all([d1, d2])
        db.flush()
        db.add_all([
            DealEvent(deal_id=d1.id, old_stage=None, new_stage="qualified", changed_by=admin.id, created_at=now - timedelta(days=2)),
            DealEvent(deal_id=d1.id, old_stage="qualified", new_stage="offer", changed_by=agent1.id, created_at=now - timedelta(days=1)),
            DealEvent(deal_id=d1.id, old_stage="offer", new_stage="negotiation", changed_by=agent1.id, created_at=now),
            DealEvent(deal_id=d2.id, old_stage=None, new_stage="offer", changed_by=agent2.id, created_at=now - timedelta(days=1)),
            DealEvent(deal_id=d2.id, old_stage="offer", new_stage="booking", changed_by=agent2.id, created_at=now),
        ])

    db.commit()
    return {
        "users": 3,
        "properties": len(props),
        "leads": len(leads),
    }


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    commands = parser.add_subparsers(dest="command", required=True)
    commands_by_name = {
        "create-admin": (create_admin, "Create an agency (if needed) and its admin user"),
        "create-agent": (create_agent, "Create an agent in an existing agency"),
    }
    for name, (_, help_text) in commands_by_name.items():
        command = commands.add_parser(name, help=help_text)
        command.add_argument("--agency", required=True)
        command.add_argument("--email", required=True)
        command.add_argument("--name", required=True)

    seed_cmd = commands.add_parser("seed-demo", help="Populate idempotent demo data for the MVP")
    seed_cmd.add_argument("--password", default="AqarFlowDemo!2026", help="Demo password (min 12 chars)")

    args = parser.parse_args()

    if args.command == "seed-demo":
        if len(args.password) < MIN_PASSWORD_LENGTH:
            sys.exit(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")
        with SessionLocal() as db:
            summary = seed_demo_data(db, password=args.password)
        print(
            f"Demo data ready for 'Islamabad Capital Towers': "
            f"{summary['users']} users, {summary['properties']} properties, {summary['leads']} leads."
        )
        return

    password = getpass.getpass("Password: ")
    if len(password) < MIN_PASSWORD_LENGTH:
        sys.exit(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")
    if password != getpass.getpass("Confirm password: "):
        sys.exit("Passwords do not match.")
    command_function, _ = commands_by_name[args.command]
    command_function(args.agency, args.email, args.name, password)


if __name__ == "__main__":
    main()
