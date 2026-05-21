# GitHub Setup

## Branch Protection

Configure this rule for `main` in GitHub:

1. Go to Settings > Branches > Add branch ruleset or branch protection rule.
2. Target branch: `main`.
3. Require a pull request before merging.
4. Require at least 1 approving review.
5. Require status checks to pass before merging.
6. Select the CI check from `.github/workflows/ci.yml`.
7. Require branches to be up to date before merging.
8. Restrict force pushes and deletions.
9. Save the rule.

## Required Checks

The CI workflow runs:

- `pnpm install`
- `pnpm exec prisma generate`
- `pnpm exec prisma db push`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

## Recommended Repository Settings

- Enable Dependabot security updates.
- Enable secret scanning.
- Protect production Vercel environment variables.
- Require review from a code owner once ownership is defined.
