#!/bin/bash

# We're not hitting the echoes endpoint anymore. Instead, we're sending these
# calls to a proprietary platform endpoint, which is in turn sending to echoes.
tags=( $(git describe --abbrev=0 --tags $(git rev-list --tags --max-count=2)) )

tag=${tags[0]}
prev_tag=${tags[1]}

tagdate=$(git log -1 --format=%cI "${tag}")
isoDate=$(perl -e "use Date::Parse; use DateTime; print DateTime->from_epoch(epoch => str2time('$tagdate')).Z")

url="https://github.com/awell-health/hosted-pages/releases/tag/${tag}"

commits=( $(git log --pretty=format:%H "${prev_tag}".."${tag}") )
commitsJSON=$(jq --compact-output --null-input '$ARGS.positional' --args "${commits[@]}")

deliverablesJSON='["hosted-pages"]'

echo ${tag}
echo ${isoDate}
echo ${deliverablesJSON}
echo ${commitsJSON}
# We're updating the status of the deployment directly here, given this job
# runs after a successful release
curl --silent --show-error --fail --location --request POST ${PLATFORM_ENDPOINT} \
--header 'Content-Type: application/json' \
--header 'x-api-key: '"${PLATFORM_API_KEY}"'' \
--data-raw '{
    "name": "'"hosted-pages"'",
    "version": "'"${tag}"'",
    "date": "'"${isoDate}"'",
    "deliverables": '"${deliverablesJSON}"',
    "commits": '"${commitsJSON}"',
    "url": "'"${url}"'",
    "status": "'"success"'"
}'