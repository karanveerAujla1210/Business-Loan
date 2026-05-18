# Frontend-Backend Contract Validation

## Frontend source
- `minbussines_react_website-main/minbussines_react_website-main/src/utils/api.js`
- `minbussines_react_website-main/minbussines_react_website-main/src/config.js`

## Verified endpoint mappings
- `GET /api/v1/get/user/details/web` used by frontend user bootstrap.
- Health check used for smoke: `GET /api/v1/health`.
- Monitoring docs path: `/api-docs`.

## Required environment alignment
- Frontend must set `VITE_API_URL` per environment:
  - local: `http://localhost:3000/api/v1`
  - staging: `https://<staging-backend>/api/v1`
  - prod: `https://backend.minibusinessloan.com/api/v1`

## Critical user journeys to validate in staging
- Mobile verification to profile progression.
- CAM/sanction progression based on `loanApplicationStatus`.
- Repayment collection integration flow.

## Exit criteria
- No hardcoded environment URL in frontend code.
- API URL switched by environment variables.
- Smoke checks pass against staging API.
