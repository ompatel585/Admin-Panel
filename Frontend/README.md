# Frontend

Next.js 16 (App Router), Tailwind v4, shadcn/ui (Base UI), Redux Toolkit Query, Formik + Yup.
See the [root README](../README.md) for what the product does.

Next.js 16 has breaking changes from earlier versions; read the guides in
`node_modules/next/dist/docs/` before changing framework-level code.

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend base URL, e.g. `http://localhost:5000/api` |

## Structure

```
src/app/          routes (thin: each page renders a view)
src/views/        one screen each
src/sections/     dialogs and parts that belong to one feature
src/components/   ui/ (shadcn), shared/, form/ (Formik fields), layout/, guards/
src/services/api/ RTK Query endpoints, one file per backend module
src/constants/    navigation, permission keys, routes, user-facing messages
src/types/        API shapes
```

Nothing is hard-coded per user. The sidebar and every action are shown or hidden from the
permission keys the API returns for the signed-in user (`usePermissions`, `<Can>`,
`<RequirePermission>`). Admins additionally get workspace filters and pickers.

API errors and success toasts are produced in one place, `store/middleware/feedback.middleware.ts`,
from the message tables in `constants/messages/`. Components never format feedback themselves.

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```
