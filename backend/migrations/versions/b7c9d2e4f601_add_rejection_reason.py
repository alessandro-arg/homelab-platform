"""add rejection reason

Revision ID: b7c9d2e4f601
Revises: 673d604a8a3c
"""

from alembic import op
import sqlalchemy as sa


revision: str = "b7c9d2e4f601"
down_revision: str = "673d604a8a3c"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "applications",
        sa.Column("rejection_reason", sa.String(length=50), nullable=True),
    )
    op.create_check_constraint(
        "ck_applications_rejection_reason",
        "applications",
        "rejection_reason IS NULL OR rejection_reason IN ("
        "'no_reason_provided', 'position_filled', "
        "'experience_or_qualifications', 'location', 'language', "
        "'salary_or_conditions', 'timing', 'other')",
    )
    op.create_check_constraint(
        "ck_applications_rejection_reason_status",
        "applications",
        "rejection_reason IS NULL OR status = 'rejected'",
    )


def downgrade() -> None:
    op.drop_constraint(
        "ck_applications_rejection_reason_status", "applications", type_="check"
    )
    op.drop_constraint(
        "ck_applications_rejection_reason", "applications", type_="check"
    )
    op.drop_column("applications", "rejection_reason")
