"""auth sessions

Revision ID: b7c1d2e3f4a5
Revises: 4a657a7ffa3c
"""
from alembic import op
import sqlalchemy as sa


revision = 'b7c1d2e3f4a5'
down_revision = '4a657a7ffa3c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("UPDATE users SET email = lower(email)")
    op.create_check_constraint('ck_users_email_lowercase', 'users', 'email = lower(email)')
    op.create_table('sessions',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('token_hash', sa.String(length=64), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('token_hash')
    )
    op.create_index(op.f('ix_sessions_user_id'), 'sessions', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_sessions_user_id'), table_name='sessions')
    op.drop_table('sessions')
    op.drop_constraint('ck_users_email_lowercase', 'users', type_='check')
