#!/bin/bash

ECHOES_API_ENDPOINT="https://api.echoeshq.com/v1/signals/deployments"
API_KEY="${ECHOESHQ_API_KEY_RELEASES}"

curl --silent --show-error --fail --location --request POST ${ECHOES_API_ENDPOINT}/${ECHOESHQ_DEPLOYMENT_ID}/status \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer '"${API_KEY}"'' \
--data-raw '{
    "status": "failure"
}'