# RAG Console

Admin panel for a multi-tenant, website-indexing SaaS.

A customer signs up and gets their own **workspace**. They add a website address; an
external pipeline (Scrapy crawler, chunker, embedder) indexes it, and they follow its
progress here. This repo is **only the panel and its API**. It contains no crawler,
chunking or embedding code.

```
Backend/    NestJS + MongoDB API   (cookie auth, permissions, tenancy, pipeline API)
Frontend/   Next.js + shadcn/ui    (everything is loaded from the API)
```

## Roles and permissions

Two roles are created on first boot (a super admin can add more from **Roles**):

| Role  | Access |
|-------|--------|
| Admin | The super admin: platform operator. Holds every permission, including ones added later. Sees all workspaces. Has no workspace of their own. |
| User  | Workspace owner. Gets a default permission set once, when the role is created; editable afterwards from **Roles**. |

The first account to sign up becomes the Admin. Every later sign-up becomes a User with a
new workspace on the free plan.

**Seeds live in their own modules** and are idempotent: they create what is missing and
never overwrite what an admin edited.

- `Backend/src/modules/permissions/seeds/permissions.seed.ts` is the permission catalog.
- `Backend/src/modules/roles/seeds/roles.seed.ts` defines Admin and User and the User's default keys.

**The super admin bypasses every permission check**, including permissions added later.

**The super admin is invisible.** The role carries `isHidden`, so every roles endpoint
(list, options, lookup, permissions) excludes it and answers `404`. People holding it are
never listed or reachable through the users API, and are left out of user counts. The Admin
role can't be assigned to anyone through the API. Wherever the signed-in user's own role
would be named (`/auth/me`) it is shown as "Restricted".

**Roles and individual permissions.** Only a super admin can add, edit or delete roles
(whatever permissions another role is given). A user's access is their role's permissions
plus any granted to that person directly: a super admin opens **Users → shield** to tick
extras on top of the role. The role's own permissions show locked there.

To add a permission, add it to the catalog (and to the User seed if it should be default)
and restart. To retire one, list its module in `RETIRED_PERMISSION_MODULES`; the seeder deletes it and revokes it from every role. It appears in the Permissions and Roles screens with no frontend change.
Permissions can also be created, edited and deactivated live from the UI.

## Tenancy

Every record (website, crawl job, user) belongs to a workspace.
Non-Admin callers are pinned to their own workspace in the service layer
(`common/utils/tenant-scope.util.ts`); another workspace's record answers `404`.
Plans (`free`, `pro`, `enterprise`) cap websites and pages per website
(`tenants.constants.ts`). A suspended workspace cannot sign in or use existing sessions.

## Soft delete

Deleting users, roles, permissions, workspaces, websites and crawl jobs never removes the
row: it stamps `deletedAt` with the time. A document with `deletedAt` set is deleted;
live ones have `deletedAt: null` (or no field, for rows written before this existed).

- A Mongoose plugin (`Backend/src/database/soft-delete.plugin.ts`) hides deleted rows from
  every query, populate and aggregate on those models, so a screen or endpoint cannot leak
  one by forgetting a filter. To read them on purpose, pass `{ withDeleted: true }` in the
  query options or name `deletedAt` in the filter.
- Repositories delete through `softDeleteById` / `softDeleteMany`.
- Deleting a workspace soft-deletes its users, websites and crawl jobs with the same
  timestamp. Deleted users can't sign in and their open sessions stop working.
- Uniqueness (email, role name, permission key, workspace slug, website URL per workspace)
  is enforced together with `deletedAt`, so a deleted value can be used again. Old
  single-field unique indexes are dropped automatically on first boot.
- Password-reset tokens are throwaway and are still hard-deleted.
- Code that reads a raw collection (`connection.collection(...)`) bypasses the plugin and
  must filter `deletedAt: null` itself.
## Data model additions (admin-db-design)

Existing collections gained these fields; see `admin-db-design.md` for the full design.

| Collection | New fields |
|---|---|
| `tenants` | `contact`, `limits` (copied from the plan, then adjustable per customer and the value that is enforced), `settings` (`retentionDays` 30-365, `defaultLlmModel`, `dataRegion`), `supportAccessUntil`, `createdBy` |
| `users` | `emailVerifiedAt`, `mfa`, `failedLogins`, `lockedUntil`, `passwordChangedAt` |
| `roles` | `key`, `scope` (`platform` or `company`), `tenant` (null for built-ins). `Admin` is `super_admin`, `User` is `owner` |
| `permissions` | `scope`, `group` |
| `sites` | `publicToken`, `secretKeyHash` (the `sk_...` secret is returned once, on create), `allowedOrigins`, `settings` (widget theme, copy, launcher, features, bot, rag, limits), `settingsVersion` |
| `crawljobs` | `heartbeatAt`, `expireAt` (TTL: a finished job is removed 90 days after it ends) |
| `passwordresettokens` | `purpose`, `usedAt` |

**Existing data** is upgraded on boot by `database/existing-data-backfill.service.ts`. It
touches only documents that lack a new field (soft-deleted ones included), so repeat runs
change nothing. Sites created before this change get a token and origin but **no secret
hash**; the secret can't be recovered, so it needs rotating once that endpoint exists.
Old finished jobs are kept at least 30 days after the upgrade before TTL removes them.

**Behaviour that changed:** five wrong passwords lock an account for 15 minutes, and a
password reset or change ends every session issued before it (the person changing it is
re-issued a fresh cookie).

## Pipeline API

Your crawler talks to the panel with a shared secret in the
`x-pipeline-key` header (`PIPELINE_API_KEY`). No user session is involved.

| Call | Purpose |
|------|---------|
| `POST /api/pipeline/jobs/claim` | Atomically take the next queued crawl job. Returns `{ jobId, tenantId, siteId, url, domain, crawl }`, or `null` when idle. |
| `PATCH /api/pipeline/jobs/:id` | Report progress: `{ status?: running\|completed\|failed, stage?: crawling\|chunking\|embedding, progress?, pagesDiscovered?, pagesCrawled?, chunksCreated?, error? }`. A job cancelled in the panel answers with its `cancelled` status so the pipeline can stop. |

Reports update the website's status (`pending → crawling → indexing → ready | failed`) and
its page/chunk counts. Websites with a `daily` or `weekly` re-crawl schedule are queued
automatically.

## Running

```bash
# Backend (needs MongoDB)
cd Backend && cp .env.example .env   # fill in secrets
npm install && npm run start:dev

# Frontend
cd Frontend && cp .env.example .env.local
npm install && npm run dev
```

Checks: `npm run lint`, `npm test` (Backend); `npm run typecheck`, `npm run lint`, `npm run build` (Frontend).
