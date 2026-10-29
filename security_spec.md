# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Global Default-Deny**: All paths not explicitly matched in `/databases/{database}/documents` are unconditionally denied (`allow read, write: if false;`).
2. **Master Gate Relational Integrity**: A `ClassroomSection` document (`/classrooms/{classId}/sections/{sectionId}`) cannot be read, created, or updated unless its parent `Classroom` document (`/classrooms/{classId}`) exists and has `status == 'active'`.
3. **Path Variable Hardening**: Every document ID (`{adminId}`, `{classId}`, `{sectionId}`) on single-document operations (`get`, `create`, `update`, `delete`) must satisfy `isValidId(id)` (`id is string && id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
4. **No Blanket List Queries**: `allow list` is explicitly denied (`if false`) across `/admins`, `/classrooms`, and `/classrooms/{classId}/sections` because the application accesses fixed, known document IDs directly via `get`.
5. **Identity & Email Verification**: All write operations require `isSignedIn()` and `request.auth.token.email_verified == true`.
6. **Bootstrapped Admin & Anti-Escalation**: Only the bootstrapped homeroom teacher email (`xuanhoa2710@gmail.com` with `email_verified == true`) or an existing `/admins/{uid}` document is recognized as `isAdmin()`. Regular users cannot self-assign admin privileges.
7. **Strict Key & Schema Enforcement**: Every `create` and `update` operation validates exact keys (`hasAll` and `hasOnly`), field types, string `.size()` bounds, enum values, immutable fields (`classId`, `sectionId`, `ownerId`, `createdAt`), and server timestamps (`request.time`).
8. **Terminal State Locking**: Once a `Classroom` has `status == 'archived'` or a `ClassroomSection` has `status == 'locked'`, non-admin users cannot update it.

---

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Unauthenticated Write)**: Attempting to create `/classrooms/12A7` with `request.auth == null`.
2. **Payload 2 (Unverified Email Spoofing)**: Attempting to write as `xuanhoa2710@gmail.com` when `request.auth.token.email_verified == false`.
3. **Payload 3 (Shadow / Ghost Field Injection on Create)**: Creating `/classrooms/12A7` with an extra undeclared field `isSuperAdmin: true`.
4. **Payload 4 (Shadow Field Injection on Update)**: Updating `/classrooms/12A7/sections/config` with an unapproved field `hackedField: "yes"`.
5. **Payload 5 (Identity Spoofing on Create)**: Creating `/classrooms/12A7` where `ownerId` does not match `request.auth.uid`.
6. **Payload 6 (Immutable Field Mutation on Update)**: Updating `/classrooms/12A7` to change `ownerId` or `createdAt`.
7. **Payload 7 (Orphaned Subcollection Write)**: Creating `/classrooms/nonexistent_class/sections/config` when `/classrooms/nonexistent_class` does not exist.
8. **Payload 8 (Terminal State Bypass)**: Non-admin user attempting to update `/classrooms/12A7/sections/config` when `existing().status == 'locked'`.
9. **Payload 9 (Resource / ID Poisoning)**: Creating a section with a 500-character ID or invalid characters (`sectionId` containing spaces/slashes) or a `className` string exceeding `maxLength: 100`.
10. **Payload 10 (Client Timestamp Forgery)**: Creating or updating `/classrooms/12A7/sections/config` with a forged past/future `updatedAt` timestamp instead of `request.time`.
11. **Payload 11 (Privilege Escalation via `/admins`)**: Non-admin user attempting to create `/admins/{theirUid}` to grant themselves admin rights.
12. **Payload 12 (Unauthorized Collection List Scraping)**: Executing a `list` query on `/classrooms` or `/admins`.

---

## 3. Test Runner Specification

The companion test file `firestore.rules.test.ts` verifies that all 12 "Dirty Dozen" payloads return `PERMISSION_DENIED` while valid authenticated operations succeed.
