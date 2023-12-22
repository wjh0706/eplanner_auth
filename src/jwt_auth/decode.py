import jwt


def handler(event, context):

    token = event['authorizationToken']
    try:
        decoded = jwt.decode(token, 'secret', algorithms=['HS256'])
        principalId = decoded['sub']
        policyDocument = {
            'Version': '2012-10-17',
            'Statement': [{
                'Action': 'execute-api:Invoke',
                'Effect': "Allow",
                'Resource': event['methodArn'],
            }]
        }
    except:
        principalId = decoded['unauthorized']
        policyDocument = {
            'Version': '2012-10-17',
            'Statement': [{
                'Action': 'execute-api:Invoke',
                'Effect': "Deny",
                'Resource': event['methodArn'],
            }]
        }
    return {
        'principalId': principalId,
        'policyDocument': policyDocument
    }
