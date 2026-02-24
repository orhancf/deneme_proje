# Security — RBAC, Audit & Row-Level Security

## RBAC Role Matrix

| Permission | ADMIN | EXEC | MANAGER | ANALYST | VIEWER |
| ---------- | :---: | :--: | :-----: | :-----: | :----: |
| View dashboards | ✅ | ✅ | ✅ | ✅ | ✅ |
| Read metrics | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export CSV/PDF | ✅ | ❌ | ✅ | ✅ | ❌ |
| Ad-hoc queries | ✅ | ❌ | ❌ | ✅ | ❌ |
| View audit log | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage config | ✅ | ❌ | ❌ | ❌ | ❌ |

## Row-Level Security (RLS)

User ↔ Organization access is managed via the `app.user_org_access` table:

```sql
-- Users see only data from their assigned organizations
SELECT * FROM analytics.fact_orders o
WHERE o.org_id IN (
  SELECT org_id FROM app.user_org_access WHERE user_id = :current_user_id
);
```

The API enforces org scope on every query. UI filter dropdowns are also scoped to the user's accessible organizations.

## Audit Trail

All user actions are logged to `app.audit_log`:

| Action | Trigger |
| ------ | ------- |
| LOGIN | User authenticates |
| LOGOUT | User logs out |
| DASHBOARD_VIEW | User opens a dashboard page |
| EXPORT | User exports CSV/PDF |
| QUERY | User runs ad-hoc metric query |
| CONFIG_CHANGE | Admin changes settings/roles |

## Authentication (SSO Ready)

Currently using NextAuth with credential placeholder. Designed for easy swap to:

- **OIDC** (Azure AD, Okta, Auth0)
- **SAML** (Corporate SSO)

## PII Masking Strategy

- Customer names/emails: Masked for VIEWER role
- Financial values: Rounded for non-EXEC roles
- Column-level masking enforced in the API layer
