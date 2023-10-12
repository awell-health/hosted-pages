#!/bin/bash

ECHOES_API_ENDPOINT="https://api.echoeshq.com/v1/signals/releases"
API_KEY="${ECHOESHQ_API_KEY_RELEASES}"

# get the 2 latest tags
tags=( $(git describe --abbrev=0 --tags $(git rev-list --tags --max-count=2)) )

tag=${tags[0]}
prev_tag=${tags[1]}

tagdate=$(git log -1 --format=%cI "${tag}")
isoDate=$(perl -e "use Date::Parse; use DateTime; print DateTime->from_epoch(epoch => str2time('$tagdate')).Z")

url="https://github.com/awell-health/hosted-pages/releases/tag/${tag}"

commits=( $(git log --pretty=format:%H "${prev_tag}".."${tag}") )
commitsJSON=$(jq --compact-output --null-input '$ARGS.positional' --args "${commits[@]}")

deliverablesJSON='["hosted-pages"]'

curl --silent --show-error --fail --location --request POST ${ECHOES_API_ENDPOINT} \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer '"${API_KEY}"'' \
--data-raw '{
    "name": "'"${tag}"'",
    "version": "'"${tag}"'",
    "date": "'"${isoDate}"'",
    "deliverables": '"${deliverablesJSON}"',
    "commits": '"${commitsJSON}"',
    "url": "'"${url}"'"
}'
   