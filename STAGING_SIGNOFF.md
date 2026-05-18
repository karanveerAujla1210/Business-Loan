# Staging Sign-off Checklist

## Functional smoke
- [ ] Backend starts with no fatal errors
- [ ] `GET /api/v1/health` returns success
- [ ] Reporting endpoints respond with valid payload shape
- [ ] Compliance export/delete/consent endpoints require authenticated user
- [ ] Metrics endpoints require internal user role

## Performance baseline
- [ ] `npm run test:load` completed
- [ ] No sustained 5xx failures during load run
- [ ] Slow request rate acceptable for target SLA

## Security checks
- [ ] TLS configured in staging ingress
- [ ] Secrets are environment-managed (not hardcoded)
- [ ] Firewall and IP restrictions reviewed
- [ ] Audit logs generated for sensitive endpoints

## Release decision
- [ ] APPROVED for production
- [ ] BLOCKED (list blockers and owners)
