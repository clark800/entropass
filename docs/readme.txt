
You only have to remember one password.
Your passwords are different for every site you log in to.
None of the secure passwords (hashes) are stored anywhere so there is no  :scare: honeypot  :/scare: of passwords that can be accessed.

uses a passphrase and a secret key file to generate a 20 digit password specific to the site that you are at. passwords are never stored, you only have to remember one master password and keep your key file safely stored.

“something you know, something you have”

for true 2-factor authentication “each factor must be validated by the other party for authentication to occur”. Here the other party only validates a hash of the two factors.

base58(sha3-512(passphrase + siteCounter + privateKey + domain)[0:16])
RFC 1924 and NIST SHA3. Note: RFC 1924 specifies that leading zeros should not be omitted, so 

Benefits Matrix

KeepPass vs. PwdHash vs. CryptoPass vs. HashFlow

One site password can’t be used to determine another
No software lockin (standardized hashing algorithm/file format)
Audit-able source code
Sandboxed execution
Source code < 1000 lines
There is no database to lose
Resistant to shoulder surfing and keyloggers (using private key)
Resistant to spoofing
Handles password resets smoothly
If master passphrase is compromised, you don’t have to change all of your site passwords
Future version may change output format - then you have to change all passwords
Uses base domain instead of host

Compared to PwdHash (does have local private key “global password”)
Fewer browser permissions required (more security)
More standardized than PwdHash using Base85 encoding, making it easier to implement new ports.
More secure implementation: master passphrase is entered into extension popup not site form, so you don’t have to worry about a bug in the extension causing your master passphrase being sent to the site.

Compared to CryptoPass
Uses a counter instead of username so you don’t have to type your username
Private key
Much more likely to have special characters in output
Option to generate with no special characters
Uses public suffix list

FAQ

Why are passwords 20 characters long?
This is the longest Base85 output that standard RFC 1924 implementations are required to support. RFC 1924 chose Base85 because the number of 20-character strings in Base85 is slightly larger than the number of 128 bit IPv6 addresses.

Why not use key strengthening?
So that the UI will be fast even on slower mobile devices.

What if the site limits passwords to 16 characters?
Just delete the last 4 characters after inserting the password.

What if I have multiple accounts on the same site?
Just add a suffix to your master passphrase for each account e.g. “.1” and “.2”.

Why isn’t the private key encrypted?
The private key represents a “something you have” authentication factor: access to the file is the limiting factor, so there is no significant benefit to encrypting the private key. If it were encrypted with the master passphrase, then an attacker still would only need to guess the master passphrase to crack the system. If it was encrypted with a separate passphrase, this would be equivalent to just making a longer passphrase. Therefore, the private key is left unencrypted to reduce the complexity of the code. 

Vulnerabilities & Disadvantages
If a site forces you to change your password (perhaps because they got hacked or due to a password policy), you will have to use a different passphrase for that site. It doesn’t have to be completely different, just adding a digit at the end is fine, but you still have to remember to add that suffix in the future.
http://alexking.org/blog/2013/03/25/the-problem-with-pwdhash

Some sites may have password policies that 

If attacker gets your private key and one of your site passwords, they can try to brute force attack your passphrase. Choosing a sufficiently secure passphrase can mitigate this risk.

If either your passphrase or private key is compromised (but not both), you are still potentially safe for a while, but to re-establish high security you will have to replace the compromised factor and change ALL of your site passwords. The same is true for password managers based on encrypted databases though. If an attacker gains access to your encrypted database, they can try to crack it by brute force. 
