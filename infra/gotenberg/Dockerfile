# Gotenberg (Chromium-based HTML -> PDF) for Naatiq CV rendering.
# Runs as its own small service; the generate-cv Edge Function calls it at
# ${GOTENBERG_URL}/forms/chromium/convert/html.

FROM gotenberg/gotenberg:8

# The base image sets ENTRYPOINT ["gotenberg"]. Reset it so we can bind to the
# platform-provided $PORT (Railway / Fly set this dynamically) via a shell.
ENTRYPOINT []
CMD ["sh", "-c", "gotenberg --api-port ${PORT:-3000} --api-timeout=120s"]
