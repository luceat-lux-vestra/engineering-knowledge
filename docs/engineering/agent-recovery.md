# Crash-Recoverable Agent Work

This document defines repository-operation recovery after an agent session, connection, harness, or process interruption in `luceat-lux-vestra/engineering-knowledge`.

It complements root `AGENTS.md`. It does not grant additional product, publication, deployment, cross-repository, or merge authorization.

## Authority

For execution recovery, use:

1. current GitHub execution state;
2. current repository-local policy and accepted contracts;
3. the active owning-Issue checkpoint;
4. prior conversation or agent memory.

GitHub is authoritative for Issues, refs, commit SHAs, PRs, checks/workflows, reviews, rulesets/protection, merge state, and default-branch state. Publication/deployment claims additionally require the evidence appropriate to that surface.

A checkpoint is only a resume hint and never overrides current authority.

## One canonical rolling checkpoint

For recoverable GitHub-tracked work, maintain one mutable comment on the owning Issue marked:

`<!-- agent-resume-checkpoint:v1 -->`

The checkpoint is a **latest-state snapshot, not an append-only log**.

Keep only the state required to resume safely:

- owning work item and current bounded work unit;
- current phase;
- branch/base and exact candidate/PR HEAD when relevant;
- concise completed outcomes needed for context;
- current verification/acceptance state;
- blockers;
- next safe action;
- explicit STOP condition.

Replace or remove obsolete state. Do not accumulate old HEADs, repeated CI snapshots, per-turn notes, session handoffs, or chronological execution history. Git commits, PR history, Issue events, reviews, and deployment records already own that history.

Before writing checkpoint state:

1. fresh-read Issue comments;
2. locate the canonical marker;
3. if exactly one exists, edit it in place;
4. if none exists, create one only when durable recovery state is needed;
5. if duplicates exist, do not add another; reconcile them first.

Do not rewrite or delete human decisions, review discussion, or independently durable evidence merely to shorten the checkpoint.

## Single writer and concurrent work

The owning work item has one checkpoint writer at a time.

Delegates may propose state but must not concurrently overwrite the checkpoint. Where version-checked compare-and-swap, a lock, or another coordination mechanism is available, use it. Otherwise operate as a single writer.

Before replacing checkpoint state, confirm the prior state you are replacing. If a concurrent or uncertain write is detected, re-read GitHub, reconcile, and STOP. Never use last-writer-wins reasoning.

If another actor moves a branch, PR, base, Issue ownership, workflow policy, or deployment state, current authoritative state wins after ownership is reconciled.

## Resume protocol

Before mutating resumed work:

```text
read AGENTS.md and applicable repository docs
-> discover open production PRs
-> identify owning Issue and canonical checkpoint
-> fresh-read current main / branch / PR HEAD / base
-> read checks, reviews, rulesets, protection, or deployment state when decision-relevant
-> compare checkpoint with authority
-> classify the mismatch
-> derive exactly one safe next work unit
```

Classify recovery as:

- `MATCH`
- `CHECKPOINT_STALE_BUT_RECONCILABLE`
- `EXTERNAL_STATE_MISSING_RETRYABLE`
- `CONFLICT`
- `UNKNOWN`

Material `UNKNOWN`, `UNVERIFIED`, or insufficient evidence fails closed.

## Mutation protocol

Every material external mutation follows:

```text
fresh precondition read
-> one bounded mutation
-> authoritative read-back
-> classify the postcondition
-> update the checkpoint only after verification
-> STOP at the authorized lifecycle boundary
```

If a response/session is lost after a create, branch move, PR mutation, merge, Pages/DNS change, or other external action, never repeat it solely because the checkpoint did not advance. Search/read authority first and determine whether the mutation succeeded, failed, conflicted, or remains unknown.

## Exact-HEAD evidence

Current PR HEAD is authoritative for HEAD-specific evidence.

If PR HEAD changes, prior HEAD-specific CI/review evidence is invalid unless a repository contract explicitly defines another proof scope. Validate the new exact final HEAD before relying on it.

Do not use branch names, old checkpoint SHAs, or a previous session's memory as a substitute for current GitHub ref state.

## Base advancement with unchanged HEAD

An unchanged PR HEAD does not automatically make old evidence valid or invalid after `main` advances.

Before reusing evidence:

1. fresh-read current PR HEAD, current base, mergeability, applicable required checks/rules, and review state;
2. identify whether the evidence proves the immutable HEAD itself or an old base+HEAD/synthetic merge composition;
3. inspect base and PR deltas for material semantic interaction;
4. revalidate when current policy requires latest-base/current-composition proof or when the interaction is material/unknown.

Material interaction includes, as applicable:

- workflow, Pages, dependency/submodule, build/runtime, or validation changes;
- knowledge-link validation or source/projection contract changes;
- generated/publication artifacts or canonical URL behavior;
- security/evidence-producing policy changes.

Different filenames alone do not prove semantic independence.

If the HEAD changes because of rebase, conflict resolution, branch update, regeneration, or another push, it is a new exact-HEAD proof unit.

## CI observation and remediation

CI observation is one bounded logical snapshot for the exact revision.

Do not poll, wait-to-green, rerun-to-green, or automatically cross from observation into remediation.

- running/queued -> `PENDING`, STOP;
- missing/provenance unknown -> `UNVERIFIED` or `BLOCKED`, STOP;
- failed -> `FAIL`, STOP unless remediation itself is the authorized work unit;
- passed -> record only what the observed checks actually prove.

Do not weaken validation, publication conditions, branch/ruleset enforcement, or tests to preserve old evidence or force success.

## Public-repository privacy

This repository is public. Checkpoints, Issues, PRs, comments, commits, and logs must therefore contain only public-safe execution metadata.

Never store:

- credentials, tokens, private keys, or secret values;
- hidden reasoning or raw private prompts/transcripts;
- personal secrets or unrelated private data;
- confidential employer/customer/system topology;
- sensitive provenance copied from private repositories merely to explain a public change.

Use public-safe summaries and links only when the linked material is itself appropriate for public disclosure.

## Completion

Merged is not automatically done.

Complete any required default-branch/post-merge verification, public artifact/deployment verification when applicable, linked-Issue acceptance, and housekeeping before marking the work item complete.

Each individual authorization still stops at its separately defined lifecycle boundary.
