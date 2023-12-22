import jwt
import datetime

# Your secret key
secret = 'secret'

# Payload data (can be any data you want to include in the token)
payload = {
    'sub': 'user0',  
    #'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1) 
}

# Generate the JWT token
token = jwt.encode(payload, secret, algorithm='HS256')

print("JWT Token:", token)