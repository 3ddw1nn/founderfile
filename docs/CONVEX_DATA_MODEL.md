# Convex Data Model

This is the first-pass Convex schema plan. Field names can change during implementation, but the ownership boundaries should stay intact.

## Core Principles

- Every user-owned record must be scoped to the authenticated user or workspace.
- V1 can use a single-user workspace model.
- Admin content should be separate from user-generated records.
- Document templates and generated documents should be versioned.
- The app should not collect or store SSNs.

## Tables

### users

Purpose:

- App-level user profile and role.

Fields:

- `authSubject`
- `email`
- `name`
- `role`: `owner | admin`
- `createdAt`
- `updatedAt`

### workspaces

Purpose:

- User's business setup workspace.

Fields:

- `ownerUserId`
- `name`
- `activeBusinessProfileId`
- `createdAt`
- `updatedAt`

V1 can create one workspace automatically per user.

### founderProfiles

Purpose:

- Personal founder setup information.

Fields:

- `workspaceId`
- `legalName`
- `state`
- `city`
- `county`
- `operatesFromHome`
- `acceptsPayments`
- `usesSeparateBusinessName`
- `separateBusinessName`
- `hasContractors`
- `hasCustomerContracts`
- `collectsUserData`
- `sellsTangibleGoods`
- `plansHardwareOrPreorders`
- `createdAt`
- `updatedAt`

Do not store SSN.

### businessProfiles

Purpose:

- The user's current or planned business setup.

Fields:

- `workspaceId`
- `currentPhase`: `sole_proprietor | llc_ready | llc_formed`
- `legalOperatorName`
- `plannedLlcName`
- `cityBusinessLicenseCity`
- `cityBusinessLicenseStatus`
- `dbaStatus`
- `stripeSetupStatus`
- `sellerPermitStatus`
- `domainName`
- `domainOwnershipStatus`
- `createdAt`
- `updatedAt`

Edward defaults:

- `legalOperatorName`: Edward's legal name.
- `plannedLlcName`: `Whale Tales Labs LLC`.
- `cityBusinessLicenseCity`: `Irvine`.

### productLines

Purpose:

- Products/business lines under the founder's setup.

Fields:

- `workspaceId`
- `name`
- `description`
- `type`: `software | browser_extension | hardware | services | digital_product | other`
- `acceptsPayments`
- `collectsUserData`
- `hasAdvertiserMoney`
- `hasRewardsOrPayouts`
- `hasHardwareRisk`
- `status`
- `createdAt`
- `updatedAt`

Edward defaults:

- `MOMO`
- `Trovr`

### intakeAnswers

Purpose:

- Raw answers from guided intake flows.

Fields:

- `workspaceId`
- `flowKey`
- `answers`
- `completedAt`
- `createdAt`
- `updatedAt`

### roadmapTasks

Purpose:

- Personalized user task instances.

Fields:

- `workspaceId`
- `phaseKey`
- `taskKey`
- `title`
- `description`
- `status`: `not_started | in_progress | blocked | ready | complete | not_needed`
- `priority`
- `dueAt`
- `completedAt`
- `sourceRequirementIds`
- `walkthroughId`
- `documentTemplateIds`
- `createdAt`
- `updatedAt`

### walkthroughs

Purpose:

- Admin-managed walkthrough content for online/government forms.

Fields:

- `slug`
- `title`
- `jurisdiction`
- `category`
- `officialUrl`
- `estimatedMinutes`
- `prerequisites`
- `steps`
- `warnings`
- `outputToSave`
- `lastReviewedAt`
- `status`: `draft | published | archived`
- `createdAt`
- `updatedAt`

Examples:

- `irvine-business-license`
- `ca-sos-llc-articles`
- `ca-sos-statement-of-information`
- `irs-ein`
- `cdtfa-sellers-permit`
- `county-dba-fbn`

### documentTemplates

Purpose:

- Admin-managed document templates.

Fields:

- `slug`
- `title`
- `category`
- `phaseKey`
- `templateFormat`: `markdown`
- `templateBody`
- `requiredAnswerKeys`
- `version`
- `status`: `draft | published | archived`
- `lastReviewedAt`
- `createdAt`
- `updatedAt`

### generatedDocuments

Purpose:

- User-generated document outputs.

Fields:

- `workspaceId`
- `templateId`
- `templateVersion`
- `title`
- `bodyMarkdown`
- `profileSnapshot`
- `generatedAt`
- `reviewStatus`: `draft | reviewed | exported`
- `createdAt`
- `updatedAt`

### complianceRequirements

Purpose:

- Admin-managed requirements/rules.

Fields:

- `slug`
- `title`
- `jurisdiction`
- `category`
- `appliesWhen`
- `recurrence`
- `officialSourceIds`
- `warningLevel`
- `status`
- `lastReviewedAt`
- `createdAt`
- `updatedAt`

### officialSources

Purpose:

- Official links and source summaries.

Fields:

- `title`
- `url`
- `agency`
- `jurisdiction`
- `summary`
- `lastReviewedAt`
- `status`
- `createdAt`
- `updatedAt`

### filingRecords

Purpose:

- User-entered records of completed filings and receipts.

Fields:

- `workspaceId`
- `taskId`
- `filingType`
- `filingName`
- `filedAt`
- `confirmationNumber`
- `notes`
- `attachmentStorageId`
- `createdAt`
- `updatedAt`

### reminders

Purpose:

- Due dates and recurring compliance reminders.

Fields:

- `workspaceId`
- `requirementId`
- `title`
- `dueAt`
- `status`: `scheduled | sent | dismissed | complete`
- `emailEnabled`
- `createdAt`
- `updatedAt`

### supportRequests

Purpose:

- Contact/support messages.

Fields:

- `workspaceId`
- `userId`
- `email`
- `subject`
- `message`
- `status`: `open | replied | closed`
- `createdAt`
- `updatedAt`

### auditEvents

Purpose:

- Important user/admin actions.

Fields:

- `workspaceId`
- `userId`
- `action`
- `entityType`
- `entityId`
- `metadata`
- `createdAt`

## Rule Evaluation

Rule engine should derive:

- Recommended phase.
- Required tasks.
- Not-needed tasks.
- Warnings.
- Document readiness.
- Compliance triggers.

Initial rules:

- No LLC exists -> recommend Phase 0.
- Operates under legal name -> no DBA/FBN recommended.
- Uses separate business name while sole proprietor -> DBA/FBN task becomes ready.
- Accepts payments -> Stripe setup task becomes ready.
- Sells tangible goods -> seller's permit decision task becomes ready.
- Meaningful revenue/risk/contracts/contractors/user data/advertiser money/hardware -> Phase 1 LLC readiness task becomes ready.
- Planned LLC exists -> domain assignment and IP assignment tasks become ready.

## Function Groups

Convex files can be organized by domain:

- `users.ts`
- `workspaces.ts`
- `intake.ts`
- `roadmap.ts`
- `tasks.ts`
- `walkthroughs.ts`
- `documents.ts`
- `templates.ts`
- `requirements.ts`
- `sources.ts`
- `filings.ts`
- `reminders.ts`
- `support.ts`
- `admin.ts`
- `email.ts`
- `rules.ts`

