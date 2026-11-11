"""property media storage key index

Revision ID: c3d4e5f6a7b8
Revises: b7c1d2e3f4a5
"""
from alembic import op


revision = 'c3d4e5f6a7b8'
down_revision = 'b7c1d2e3f4a5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(op.f('ix_property_media_storage_key'), 'property_media', ['storage_key'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_property_media_storage_key'), table_name='property_media')
