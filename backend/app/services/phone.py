import re

DIGITS = re.compile(r"\D")


def normalize_phone(raw: str) -> str | None:
    """E.164 form; numbers without an international prefix are treated as Pakistani (+92), as on the frontend."""
    value = raw.strip()
    digits = DIGITS.sub("", value)
    if value.startswith("+") or value.startswith("00"):
        international = digits[2:] if value.startswith("00") else digits
        return f"+{international}" if 8 <= len(international) <= 15 else None
    local = digits[2:] if digits.startswith("92") and len(digits) >= 11 else digits.removeprefix("0")
    return f"+92{local}" if 9 <= len(local) <= 10 else None
