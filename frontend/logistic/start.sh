#!/bin/bash
set -e

# Replace environment variables in runtime-config.js
if [ -f /opt/app-root/src/runtime-config.js ]; then
  envsubst < /opt/app-root/src/runtime-config.js > /opt/app-root/src/runtime-config.js.tmp
  mv /opt/app-root/src/runtime-config.js.tmp /opt/app-root/src/runtime-config.js
fi

# Start nginx using the s2i run script
exec /usr/libexec/s2i/run
