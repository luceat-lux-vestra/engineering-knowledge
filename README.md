# engineering-knowledge

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
