# MiniBusiness Loan Production Runbook

## 1) Pre-deployment
- Ensure `.env` is set with production secrets and `NODE_ENV=production`.
- Run: `npm ci && npm run lint && npm test`.
- Run smoke/load checks against staging:
  - `npm run test:smoke`
  - `npm run test:load`
- Verify backups path exists and contains recent backups:
  - `npm run db:backup:check`

## 2) Deployment
- Use controlled deployment script: `deploy.bat`.
- Validate startup logs do not contain boot errors.
- Verify health endpoint: `/api/v1/health`.
- Verify metrics endpoint using internal auth.

## 3) Post-deployment validation
- Run smoke test against production URL:
  - `SMOKE_BASE_URL=https://<prod-domain> npm run test:smoke`
- Confirm key paths:
  - Login/OTP
  - Application submission
  - Sanction and repayment access
- Confirm dashboards:
  - `/api-docs`
  - `/dashboard`
  - `/analytics`

## 4) Incident response
- If severe degradation appears:
  - stop current deployment
  - rollback to previous known-good artifact
  - validate `/api/v1/health`
  - notify stakeholders

## 5) Daily operations checklist
- Error trend reviewed.
- Slow request trend reviewed.
- Backup freshness confirmed.
- Security alerts reviewed.
