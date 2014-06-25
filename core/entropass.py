# Copyright (c) 2014 Chris Clark
import re
from base64 import b64encode, b85encode
from hashlib import pbkdf2_hmac


# privateKeyHash is the SHA-512 hash of the private key in lowercase hex
# or the empty string if no private key is set
def generate_password(passphrase, resetCount, privateKeyHash, domain,
                      allowSymbols, length):
    resetCountString = str(resetCount) if resetCount > 0 else ''
    secret = (passphrase + resetCountString + privateKeyHash).encode('utf-8')
    key = pbkdf2_hmac('sha512', secret, domain.encode('utf-8'), 100)
    if allowSymbols:
        return b85encode(key).decode('ascii')[:length]
    else:
        b64 = b64encode(key).decode('ascii')
        return re.sub(r'[\W_]+', '', b64).ljust(len(b64), '0')[:length]
