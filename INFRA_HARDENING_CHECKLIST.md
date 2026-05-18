# Infrastructure Hardening Checklist

## TLS and network security
- [ ] Install valid SSL certificates on ingress/load balancer.
- [ ] Enforce HTTPS redirect for all external traffic.
- [ ] Restrict inbound ports to required service ports only.
- [ ] Enable DDoS protection at edge provider.

## Secret management
- [ ] Rotate `SESSION_SECRET_KEY`, `JWT_SECRET`, and `ENCRYPTION_KEY`.
- [ ] Move secrets to environment/secret manager (no plaintext in repo).
- [ ] Validate secret rotation rollback process.

## Database reliability
- [ ] Apply/verify indexes via `npm run db:indexes`.
- [ ] Configure scheduled backup jobs.
- [ ] Validate backup integrity via `npm run db:backup:check`.
- [ ] Run restoration drill on non-production environment.

## Observability
- [ ] Forward logs to centralized aggregator (ELK/CloudWatch equivalent).
- [ ] Integrate error tracking (Sentry or equivalent).
- [ ] Ensure alert thresholds are configured and tested.
