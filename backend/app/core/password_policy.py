import re
from typing import Optional

def validate_strong_password(password: str) -> Optional[str]:
    """
    Validates that a password satisfies strong security requirements.
    Returns None if valid, or a user-friendly error message if invalid.
    """
    if not password or len(password) < 8:
        return "Password must be at least 8 characters long."
    
    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter (A-Z)."
        
    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter (a-z)."
        
    if not re.search(r"[0-9]", password):
        return "Password must contain at least one number (0-9)."
        
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>\-_+=\[\]]", password):
        return "Password must contain at least one special character (e.g. !@#$%^&*)."
        
    return None
