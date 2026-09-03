# Production deployment

Start the production server with a non-blank `SOFINE_ADMIN_TOKEN` and, if needed, a `PORT` value:

```sh
SOFINE_ADMIN_TOKEN='replace-with-a-secret' PORT=8787 pnpm start
```

Inquiry rate limiting uses `socket.remoteAddress` by default and ignores all forwarding headers. Set `TRUST_PROXY=1` only when the application is behind a trusted reverse proxy that removes any client-supplied `X-Forwarded-For` header and writes its own canonical client-address chain. Enabling it behind an untrusted proxy would allow clients to choose rate-limit keys.

```sh
SOFINE_ADMIN_TOKEN='replace-with-a-secret' TRUST_PROXY=1 PORT=8787 pnpm start
```
