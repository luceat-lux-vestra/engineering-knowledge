# engineering-knowledge

[![GitHub Stars](https://img.shields.io/github/stars/luceat-lux-vestra/engineering-knowledge?style=flat&label=Stars)](https://www.star-history.com/?repos=luceat-lux-vestra%2Fengineering-knowledge&type=date)

개발/아키텍처 지식을 **이해하고 다시 떠올리기 위한 개인 지식 저장소**다.

이 저장소는 기사 링크나 뉴스 요약을 쌓는 곳이 아니다. 같은 주제를 나중에 다시 봤을 때 빠르게 복원할 수 있도록, 개념을 자기 말로 정리하고 관련 소스를 누적한다.

## 역할

- `engineering-knowledge`: 이해하고 기억하기 위한 지식
- `research-to-action`: 검증하거나 적용할 가치가 있는 가설과 실험
- `ox0`: 실증·적용 결과가 생긴 뒤 외부에 공개할 가치가 있는 글

흐름은 다음과 같다.

```text
mail / article / paper / incident
            ↓
engineering-knowledge
            ↓
"실제로 검증하거나 적용할 가치가 있는가?"
            ↓ yes
research-to-action
            ↓
experiment / implementation / evidence
            ↓
"외부에 공유할 만한 결과가 있는가?"
            ↓ yes
ox0
```

## 저장 원칙

1. **기술명이 아니라 개념 중심으로 저장한다.**
   - 좋은 예: `progressive-collapse.md`, `idempotent-synchronization.md`
   - 피할 예: `infoq-2026-08-article.md`
2. 기사 요약을 복사하지 않는다. 반드시 `한 줄 요약`, `내가 이해한 예`, `헷갈리는 점`을 남긴다.
3. 새 소스를 발견해도 같은 개념이면 기존 문서의 `Sources`에 누적한다.
4. 아직 행동이 없으면 R2A로 올리지 않는다.
5. 실제 실험·적용 결과가 없으면 ox0 글감으로 승격하지 않는다.

## 지식 연결 정책

이 저장소의 문서는 독립된 메모 묶음이 아니라 **연결된 knowledge graph**로 관리한다.

1. 새 문서를 작성하거나 기존 문서를 보강할 때, 이미 존재하는 문서와 의미 있는 관계가 있으면 본문 문맥 안에서 내부 링크로 연결한다.
2. 저장소가 소유하는 canonical 내부 링크는 GitHub와 Quartz에서 모두 읽히는 **상대경로 Markdown 링크**를 사용한다. 예: `[Virtual Threads](../concepts/virtual-threads.md)`.
3. `## Related`는 보조 탐색 영역이다. 기존 문서 제목을 Related에 적을 경우 평문으로 두지 말고 실제 내부 링크로 만든다.
4. backlink는 반대편 문서에 역링크를 중복 작성해서 만드는 것이 아니다. 실제 한쪽의 의미 있는 링크에서 Quartz가 파생한다.
5. graph 밀도를 높이기 위한 억지 링크나 "문서당 최소 N개 링크" 규칙은 두지 않는다. 관계가 없으면 링크가 없어도 된다.
6. 존재하지 않는 개념을 graph 채우기 목적으로 문서화하거나, 비슷한 이름의 다른 문서에 임의로 연결하지 않는다.
7. CI는 로컬 Markdown 링크의 실제 대상 존재 여부와, Related에서 이미 존재하는 문서를 평문으로 남긴 경우를 검증한다. broken internal link는 merge 전에 실패해야 한다.
8. Quartz의 graph/backlinks는 이 Markdown 관계를 보여주는 projection일 뿐이며, 관계의 source of truth는 문서 내용이다.

## 문서 상태

- `seed`: 처음 정리한 상태. 아직 이해가 얕거나 질문이 남아 있음.
- `learning`: 여러 소스를 통해 개념이 보강되고 있음.
- `stable`: 다시 읽었을 때 독립적으로 이해할 수 있고, 핵심 질문에 답할 수 있음.

## 최소 문서 템플릿

```markdown
# Topic

- Status: seed
- Added: YYYY-MM-DD

## 한 줄 요약

## 왜 중요한가

## 핵심 개념

## 내가 이해한 예

## 헷갈리는 점

## 다시 떠올리기

Q. ...?
A. ...

## Related

## Sources
```

## 승격 규칙

### → research-to-action

다음 중 하나가 성립할 때만 승격한다.

- 현재 프로젝트 설계에 직접 영향을 줄 수 있다.
- 검증 가능한 기술 가설이 생겼다.
- 성능/안정성/운영비/개발 생산성 개선 가능성을 실제로 측정할 수 있다.
- 외부 사례를 우리 코드/워크로드에서 재현할 이유가 있다.

단순히 "좋은 개념", "공부할 가치가 있음"은 승격 사유가 아니다.

### → ox0

다음이 있어야 한다.

- 직접 한 실험, 구현, 장애 분석, 운영 경험 중 하나 이상
- 재현 가능한 근거 또는 비교 자료
- 단순 뉴스 요약을 넘어선 자체 결론

## Initial knowledge set — 2026-08

- [Agent Context Engineering](concepts/agent-context-engineering.md)
- [Virtual Threads](concepts/virtual-threads.md)
- [Random Access Parquet](concepts/random-access-parquet.md)
- [Progressive Collapse](concepts/progressive-collapse.md)
- [Idempotent Synchronization](patterns/idempotent-synchronization.md)
- [State-Space Remediation](patterns/state-space-remediation.md)
- [Durable Workflow](systems/durable-workflow.md)


## Knowledge set — 2026-09

- [Telemetry Signal vs Volume](concepts/telemetry-signal-vs-volume.md)
- [Backlog Depth vs Age](concepts/backlog-depth-vs-age.md)
- [Progressive Delivery for Foundational Platforms](patterns/progressive-delivery-for-foundational-platforms.md)
- [Infrastructure State Boundaries](patterns/infrastructure-state-boundaries.md)
- [Workload-Specialized Storage](patterns/workload-specialized-storage.md)

Updated existing notes:

- [Durable Workflow](systems/durable-workflow.md) — Postgres durable execution and Netflix Conductor scaling
- [Agent Context Engineering](concepts/agent-context-engineering.md) — durable receipts and context compression


## Knowledge set — 2026-10

- [Structured Concurrency](concepts/structured-concurrency.md)
- [DPoP and Sender-Constrained Tokens](concepts/dpop-and-sender-constrained-tokens.md)
- [Reproducible Builds](concepts/reproducible-builds.md)
- [Formal Methods Thinking](concepts/formal-methods-thinking.md)
- [Object Storage as a Durable Log](patterns/object-storage-durable-log.md)
- [End-to-End Latency Optimization](patterns/end-to-end-latency-optimization.md)

Updated existing notes:

- [Backlog Depth vs Age](concepts/backlog-depth-vs-age.md) — zero lag vs recovery verdict
- [Agent Context Engineering](concepts/agent-context-engineering.md) — downstream verification bottlenecks

Promotion candidate, not yet created in R2A:

- Distributed batch with database-only coordination — Spring Batch brokerless partitioning as evidence for an OxideBatch experiment


## Knowledge set — 2026-11

- [Verification Yield vs Accuracy](concepts/verification-yield-vs-accuracy.md)
- [Deployment Convergence and Isolation](patterns/deployment-convergence-and-isolation.md)
- [Technical Debt as Learning Debt](concepts/technical-debt-as-learning-debt.md)

Updated existing notes:

- [Idempotent Synchronization](patterns/idempotent-synchronization.md) — check-then-act race and database-enforced uniqueness
- [Agent Context Engineering](concepts/agent-context-engineering.md) — repository hygiene and agent distraction
- [Backlog Depth vs Age](concepts/backlog-depth-vs-age.md) — user-visible queue latency and distributed tracing

Existing R2A owners enriched from November evidence:

- #35 — concurrent idempotency / database invariant
- #7 — agent distraction / context signal density
- #62 — verification accuracy vs yield / correlated reviewers
- #45 — MCP gateway production governance
