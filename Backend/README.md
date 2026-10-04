# Backend

NestJS 12 + MongoDB (Mongoose). See the [root README](../README.md) for what the product does.

## Environment

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Database connection string |
| `PORT` | HTTP port |
| `FRONTEND_URL` | Allowed CORS origin and base for password-reset links |
| `JWT_SECRET` | At least 16 characters |
| `JWT_EXPIRES_IN_SECONDS` | Session lifetime |
| `PASSWORD_RESET_TTL_MINUTES` | Reset link lifetime |
| `PIPELINE_API_KEY` | Shared secret for the crawl/index pipeline (`x-pipeline-key`), at least 16 characters |

## Modules

`auth`, `users`, `roles`, `permissions`, `tenants`, `sites`, `crawl-jobs`,
`dashboard`, `pipeline`, `health`, `mail`.

Each feature module follows the same layout: `constants/` (errors and messages),
`schemas/`, `dto/`, a repository (the only code touching the Mongoose model), a service,
a controller, and a module. Controllers declare the permission they need with
`@RequirePermissions(...)`; tenant isolation is applied in services through
`common/utils/tenant-scope.util.ts`.

## Seeding

`permissions/seeds/permissions.seed.ts` and `roles/seeds/roles.seed.ts` hold the data;
`PermissionsSeeder` and `RolesSeeder` apply it on boot (permissions first). Both are
idempotent and never overwrite admin edits.

## Scripts

```bash
npm run start:dev   # watch mode
npm run build
npm run lint        # oxlint, type-aware
npm test            # vitest
```
