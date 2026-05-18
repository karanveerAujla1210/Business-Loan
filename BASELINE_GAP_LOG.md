# Baseline Verification Gap Log

## Quality gate execution
- `npm test` initially failed due to duplicate Jest config sources.
- Fix applied: removed duplicate `jest` config block from `package.json`, keeping `jest.config.js`.
- Dependency setup executed with `npm install`.

## Current verification status
- Tests/lint/format are now executable with project-local dependencies.
- CI pipeline updated to include:
  - coverage regression guard
  - backend smoke stage

## Major implementation gaps addressed in this pass
- Compliance endpoints now enforce authenticated user identity.
- Consent updates now create audit entries for traceability.
- Metrics endpoints now require internal/staff access.
- Frontend API URL now supports environment variable override.

## Remaining non-code operational tasks
- SSL/firewall/DDoS still require environment-side execution.
- Backup scheduling and restore drill require infra execution.
- Staging sign-off must be completed before production release.
