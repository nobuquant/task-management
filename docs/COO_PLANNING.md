# COO Planning: Execution Lock vs Production Lock

**Status:** Operating contract proposed from the current repository and Kanban model  
**Scope:** Research, backtest, release, and production promotion workflow  
**Decision owner:** Owner, with Auditor sign-off at the audit gate

## Executive conclusion

Execution lock and production lock are different controls protecting different failure
modes. **Execution lock freezes the thing being evaluated** so its performance and
risk evidence remain reproducible. **Production lock freezes the thing that may affect
capital** so deployment cannot silently change live behavior. Execution lock comes
first; production lock is the stricter release gate.

A green build, a completed Kanban card, or a successful backtest does not by itself
lift either lock.

## Definitions

### Execution lock

Execution lock starts when a strategy/backtest candidate is declared the reference
under review and ends only when the audit decision is recorded (ship, reject, or
return to development).

While execution-locked:

- Freeze strategy rules, parameters, signal definitions, sizing, overlays, tax/cost
  assumptions, benchmark treatment, data vintage, and backtest code that can change
  results.
- Do not retune after seeing the locked result. Any change creates a new candidate,
  new run identity, and new evidence.
- Permit only non-result-changing work: documentation, provenance, read-only
  inspection, reproducibility tooling, and fixes to a proven harness defect. A
  harness fix invalidates the prior result and requires a cold rerun.
- Record the exact data source, commit, configuration, run outputs, and audit status.

**Purpose:** prevent moving the goalposts and preserve a defensible research record.

### Production lock

Production lock starts after the execution-locked candidate clears audit and before
it is promoted to a live or production-facing artifact. It ends only after the
promotion is complete and the post-deploy sanity check is recorded, or after the
release is explicitly aborted/rolled back.

While production-locked:

- Freeze the production artifact, configuration, execution/risk logic, dependency
  versions, and deployment target.
- No feature work, parameter changes, “small” cleanup, or unreviewed data/config
  substitution may enter the release.
- Require owner approval plus the Auditor's clear stamp before production deploy.
- Verify data/API connectivity, artifact identity, risk limits, and rollback path
  immediately before promotion; verify the deployed identity immediately after.
- Emergency risk or operational fixes may bypass ordinary sequencing only when
  documented, minimized, and followed by a fresh audit/reconciliation.

**Purpose:** prevent a reviewed artifact from changing between approval and capital
exposure.

## Relationship and non-equivalence

| Question | Execution lock | Production lock |
| --- | --- | --- |
| What is protected? | Research result and its evidence | Deployable/live behavior and capital |
| Main threat | Overfitting, retuning, irreproducibility | Drift, accidental release, unsafe promotion |
| Starts | Candidate/reference run is frozen | Audit-cleared release is staged |
| Ends | Recorded audit disposition | Deploy/abort/rollback is recorded |
| Allowed changes | Documentation and proven non-result tooling only | Release verification and emergency safety action only |
| Required proof | Cold reproducibility and audit scoreboard | Byte/config identity, connectivity, risk, rollback, post-deploy check |

**Key rule:** an execution-locked result can be rejected without ever becoming a
production release. A production lock must never be used to legitimize a result that
was not execution-locked and audited.

## Kanban interpretation

The repository's Kanban defines the flow as **Brainstorm / Backlog → To Do → In
Progress → Code Review / Testing → Deployed / Done**. We map locks onto that flow as
gates, not as extra work columns:

1. **Brainstorm / Backlog:** no lock; ideas are not executable or release-eligible.
2. **To Do:** scoped work; no lock. Acceptance criteria and owner are established.
3. **In Progress:** development; no lock. Changes are expected.
4. **Code Review / Testing:** candidate enters execution-lock preparation. The lock
   is *not* claimed until the exact reference inputs/artifact are recorded and the
   audit run begins.
5. **Deployed / Done:** production lock was cleared through the release gate and the
   post-deploy check passed. “Done” means shipped, not merely merged or green in CI.

If a card changes after execution lock, move it back to **In Progress** and create a
new candidate/reference. If a release changes after production lock, abort or roll
back; do not silently edit the locked release.

## Required gate record

Every locked candidate/release should carry a compact record with:

- lock type: `execution` or `production`;
- candidate/release identifier and repository commit;
- data/config/dependency versions and immutable artifact hash where applicable;
- owner and Auditor decisions;
- checks run and their results;
- timestamp, deployment target, and rollback disposition;
- exception or emergency-change rationale, if any.

## Operational decision

Use **execution lock** for research integrity and **production lock** for capital
safety. Treat them as sequential, independently auditable gates. The Kanban status
shows work location; the lock record shows whether the work is frozen and eligible
for the next gate.

## Evidence note

The current repository is a static Kanban/task-board SPA: its source defines the five
workflow columns and its README defines `next build` plus Firebase Hosting deployment.
It does not currently encode execution-lock or production-lock fields, policies, or
workflow enforcement. This document therefore records the COO operating contract
without claiming that the UI already enforces it; enforcement remains a follow-on
implementation task.
