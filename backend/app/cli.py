import argparse
import getpass
import re
import sys

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.core.security import hash_password
from app.models import Agency, User
from app.permissions.roles import Role

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
    args = parser.parse_args()

    password = getpass.getpass("Password: ")
    if len(password) < MIN_PASSWORD_LENGTH:
        sys.exit(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")
    if password != getpass.getpass("Confirm password: "):
        sys.exit("Passwords do not match.")
    command_function, _ = commands_by_name[args.command]
    command_function(args.agency, args.email, args.name, password)


if __name__ == "__main__":
    main()
