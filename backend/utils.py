# Not sure if I want this as a separate from main, but why not, tbh stole this part from gpt anyway

from passlib.hash import pbkdf2_sha256

def hash_password(password: str) -> str:
    print(password, pbkdf2_sha256.hash(password))
    return pbkdf2_sha256.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pbkdf2_sha256.verify(plain_password, hashed_password)
