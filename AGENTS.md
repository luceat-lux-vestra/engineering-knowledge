# AGENTS.md

This file defines the repository-local operating contract for AI agents and automation working in `luceat-lux-vestra/engineering-knowledge`.

Adoption provenance: portfolio policy **EG-AI-001** from
`engineering-governance/main@69f5cee5a4ea7150b4adca0d6499b78b70e04eda`.
This file and the local recovery document are self-contained execution rules; access to the governance repository is not required at runtime.

## Repository boundary

`engineering-knowledge` is a personal engineering knowledge base.

- `README.md`, `concepts/`, `patterns/`, and `systems/` are the knowledge source of truth.
- Quartz and GitHub Pages are presentation/publication projections, not editing authority.
- Internal knowledge relationships are expressed through real relative Markdown links. Do not invent documents, links, evidence, or relationships merely to satisfy graph shape or validation.
- Promotion to `research-to-action`, Blog/ox0, or another repository is a separate decision and lifecycle. Knowledge recorded here does not authorize downstream implementation, repository mutation, publication, or merge.
- Preserve the existing Quartz submodule, Dependabot ownership, Pages deployment model, canonical `ek.ox0.uk` publication contract, and other accepted repository behavior unless the active work item explicitly changes them.

## One authorization = one bounded work unit

One explicit user authorization permits exactly one coherent work unit with one stop condition.

A work item can span many sessions. A work unit is one bounded lifecycle phase. Planning, tool calls, reviewers, subagents, local models, or retries do not create additional authorization.

Keep these boundaries separate unless the active user request explicitly scopes otherwise:

1. audit / selection;
2. implementation and durable candidate;
3. PR creation;
4. exact-HEAD CI observation and judgment;
5. remediation;
6. merge judgment / merge;
7. post-merge verification and housekeeping.

After completing the authorized unit, verify its postcondition, update the owning checkpoint, and **STOP**. Do not auto-advance merely because the next step is obvious or green.

## Authority and evidence

Before a consequential action, fresh-read the owning Issue/checkpoint and the GitHub state relevant to that action: current `main`, branch/PR HEAD/base, open production PRs, checks, reviews, rulesets/protection, or deployment state as applicable.

Authority order for repository execution is:

1. current GitHub execution state;
2. current repository-local policy and accepted contracts;
3. owning Issue and canonical rolling checkpoint;
4. prior conversation or agent memory.

A checkpoint is a resume hint, not proof that a mutation succeeded.

Use `PASS`, `FAIL`, `PENDING`, `UNVERIFIED`, `BLOCKED`, or `NOT STARTED` precisely. For material mutation or merge decisions, `UNKNOWN`, `UNVERIFIED`, and insufficient evidence fail closed.

Do not encode current GitHub enforcement as a permanent invariant. Branch protection, rulesets, required checks, merge settings, and deployment configuration must be read from live authority when they matter.

## CI observation: no polling

CI observation/judgment is its own work unit.

Perform one bounded logical observation pass for the exact candidate SHA using the minimum distinct GitHub evidence needed to determine the applicable obligations and provenance.

- queued or in-progress -> `PENDING`, then STOP;
- missing/unprovable evidence -> `UNVERIFIED` or `BLOCKED`, then STOP;
- failing evidence -> `FAIL`, then STOP unless the current authorization explicitly covers remediation.

Do not wait-to-green, repeatedly re-query evolving status, silently rerun-to-green, or advance directly from observation into remediation or merge.

A changed PR HEAD invalidates prior HEAD-specific evidence. Base advancement with unchanged HEAD follows `docs/engineering/agent-recovery.md`.

## Engineering integrity

Production behavior and repository automation must obtain mutable or environment-dependent facts from their designated authority, explicit contract, discovery, configuration, or validated input.

Do not:

- hardcode machine-specific paths, transient IDs, current SHAs, credentials, mutable endpoints, or runtime facts as universal assumptions;
- special-case a fixture, environment, user, version, or CI path merely to manufacture success;
- fabricate status, output, benchmark/test evidence, or integration results;
- swallow required failures or silently fall back to arbitrary values;
- use unexplained magic thresholds that alter behavior or recovery semantics;
- weaken tests, link validation, evidence, security, publication gates, or review rules merely to obtain green.

Legitimate protocol/domain constants, canonical URLs, reviewed dependency/security pins, reproducible fixtures, documented defaults, and explicit compatibility cases are allowed when their scope and rationale are clear.

Never commit secrets or include credentials, private prompts/transcripts, personal secrets, or unrelated sensitive provenance in source, logs, Issues, PRs, or checkpoints.

## Root-cause-first and behavioral preservation

Treat a failure as evidence to understand, not as a target to bypass.

Before remediation, establish the expected contract and root cause far enough to justify the layer being changed. Preserve externally observable behavior during refactoring unless an explicit authorized change documents and verifies the difference.

Do not mix unrelated knowledge-content edits, Quartz upgrades, workflow changes, Pages/DNS changes, dependency redesign, or downstream-repository mutations into a governance/refactor unit merely because they are nearby.

## Knowledge and publication integrity

For knowledge-content work, preserve the repository's documented storage and promotion rules.

- Distinguish observation from inference.
- Do not promote a concept to R2A merely because it is interesting; promotion needs a concrete testable/application reason.
- Do not treat R2A or EK evidence as automatic authorization for another repository.
- Do not claim publication/deployment success without evidence for the actual public artifact or deployment state required by the work item.
- Preserve the Markdown source-of-truth model and link-integrity validation unless a separately authorized change deliberately revises that contract.

## Crash-recoverable work

For non-trivial work that may span sessions, follow `docs/engineering/agent-recovery.md`.

Maintain at most one canonical mutable checkpoint comment on the owning Issue using:

`<!-- agent-resume-checkpoint:v1 -->`

The checkpoint is a **latest-state snapshot**, not an append-only session log. Replace superseded state instead of accumulating per-turn, per-phase, or CI history.

After every material external mutation, perform authoritative read-back before advancing the checkpoint. If a response is lost, re-read authority; never replay a mutation merely because the checkpoint is stale.

## Agent/runtime loading

Do not claim that these instructions govern a model, IDE agent, OMP worker, subagent, or local LLM until actual target-local loading has been demonstrated for that runtime.

For multi-agent runtimes, verify installed/runtime version, configuration precedence, repository-local instruction loading, subagent inheritance, and any persistent `RULES.md` behavior before claiming full coverage.

Until demonstrated, OMP/subagent propagation is **UNVERIFIED**.

## Change discipline

Keep changes bounded to the owning Issue and preserve concurrent work.

For PR-backed changes, record exact base and candidate HEAD provenance and review the exact final HEAD. PR creation, CI observation, remediation, merge, and post-merge verification remain separate work units.

Do not infer permission to mutate another repository, platform setting, deployment surface, or external service from this repository's Issue or policy.
