# Associate Cowrie ingestion with a registered honeypot

HoneyNetX can associate newly ingested Cowrie events with a specific registered
honeypot and update that record's attack counter. This association is opt-in
and is configured on the backend host; it does not change network bindings or
expose Cowrie's localhost-only port.

## Configure the association on the AWS host

1. Open the existing backend environment file without printing its contents:

   ```bash
   sudo nano /opt/honeynetx-secrets/backend.env
   ```

2. Add the full MongoDB ObjectId of the registered Cowrie record:

   ```dotenv
   INGESTION_HONEYPOT_ID=<full-24-character-MongoDB-ObjectId>
   ```

   Preserve the other existing environment variables. Do not put a shortened
   UI ID in this setting.

3. Save the file and restart the API:

   ```bash
   sudo systemctl restart honeynetx-backend
   sudo systemctl is-active honeynetx-backend
   ```

   The service should report `active`.

The backend validates that the configured record exists and its engine matches
the event source. If the setting is absent, invalid, or mismatched, ingestion
continues without a honeypot association and logs a warning.

## Verify with a controlled Cowrie session

From the AWS host, connect to the existing loopback-only listener:

```bash
ssh -p 2222 root@127.0.0.1
```

At the Cowrie prompt, run a benign command such as `whoami`, then exit:

```text
whoami
exit
```

Refresh HoneyNetX's Attack Logs and Honeypot pages. The new command event
should reference the registered honeypot, and its stored attack counter should
increment once when the new event is successfully stored. Duplicate event
delivery does not increment the counter.

Only newly ingested events are automatically associated. Existing historical
AttackLog records are not backfilled by this change.

## Counter and heartbeat semantics

The per-instance counter increments for newly stored actionable event types:
login attempts, successful logins, commands, file uploads/downloads, scans,
and exploits. Connection lifecycle and sensor events are associated with the
honeypot but do not inflate this counter.

This change does **not** implement heartbeat reporting. The `lastHeartbeat`
field remains unset unless a separate heartbeat mechanism writes it. The UI's
stored `online` status is not a guarantee of continuously monitored health.

## Network safety

The existing Cowrie mapping `127.0.0.1:2222 -> 2222/tcp` and MongoDB mapping
`127.0.0.1:27017 -> 27017/tcp` must remain unchanged for this task. Do not
open either port to the public internet merely to associate events.
