# Agent Context Engineering

- Status: seed
- Added: 2026-11-17
- Source month: 2026-08

## 한 줄 요약

LLM coding agent의 context window는 **자료를 최대한 많이 넣는 저장공간이 아니라, 현재 작업에 필요한 정보만 유지해야 하는 제한된 working memory**로 보는 편이 안전하다.

## 왜 중요한가

긴 agent session에서는 초기 지시와 이전 결정이 context 안에 남아 있더라도 중요도가 희석되고, 오래된 코드 상태나 불필요한 설명이 현재 작업과 경쟁한다.

그 결과 다음과 같은 drift가 생길 수 있다.

- 이미 삭제하거나 rename한 파일/경로를 다시 참조한다.
- 이전에 합의한 constraint를 놓친다.
- 자신이 만든 오류를 다시 수정하면서 작업 범위가 넓어진다.
- unrelated code까지 고치기 시작한다.
- context를 더 추가했는데 오히려 판단 품질이 떨어진다.

따라서 핵심은 "더 큰 context"보다 **더 정확한 context selection과 lifecycle 관리**다.

## 핵심 개념

- context window = working memory
- signal-to-noise ratio
- lazy-loaded context / skills
- externalized memory
- versioned context artifact
- bounded work unit
- explicit constraints
- binary done condition
- worktree isolation
- context refresh / session reset

## 내가 이해한 예

좋지 않은 방식:

```text
AGENTS.md 전체
+ 설계문서 전체
+ 과거 이슈 전체
+ 이전 40턴 대화
+ 관련 없을 수도 있는 소스코드
+ 현재 작업
        ↓
agent가 알아서 중요한 것을 찾기를 기대
```

정보량은 많지만 현재 작업에 필요한 signal이 묻힐 수 있다.

더 나은 방식:

```text
현재 목표
+ 수정 대상 파일
+ 반드시 지켜야 할 constraint
+ 관련 설계 결정 몇 개
+ 검증 방법 / done condition
        ↓
작은 작업단위 완료
        ↓
checkpoint
        ↓
다음 작업에서 필요한 context만 다시 구성
```

예를 들어 "architecture를 개선해"보다:

```text
목표: parser parity regression 제거
범위: A/B/C 파일
금지: public API 변경
검증: parity suite 전부 통과
done: 한 개 원인 제거 + read-back
```

처럼 작업 경계를 좁히는 편이 context를 덜 소비하면서도 drift를 줄일 수 있다.

서로 독립적인 작업을 병렬 agent에 맡길 때는 git worktree처럼 filesystem까지 격리하면 context뿐 아니라 **uncommitted state 간섭**도 줄일 수 있다.

## Context를 저장하는 것과 Context에 넣는 것은 다르다

장기 지식은 저장소·memory·문서에 많이 보관해도 된다.

하지만 한 번의 agent 실행에는 그중 필요한 부분만 들어가는 것이 좋다.

```text
Long-term knowledge
  ├─ docs
  ├─ memory
  ├─ ADR
  ├─ checkpoints
  └─ source code
        ↓ retrieval / selection
Current task context
        ↓
Agent
```

즉 **storage capacity와 active context capacity를 분리**해서 생각한다.

## 헷갈리는 점

- session을 언제 끊고 새 context로 시작하는 것이 좋은가?
- checkpoint에는 다음 session이 재개하는 데 필요한 최소 정보가 어느 정도 들어가야 하는가?
- 자동 retrieval이 너무 많은 정보를 다시 주입하는 문제는 어떻게 측정할 수 있는가?
- 동일 agent의 긴 session과 작은 task를 여러 agent로 분리하는 방식의 품질/비용 차이는?

## 다시 떠올리기

Q. Context window가 크면 가능한 한 많이 넣는 것이 좋은가?  
A. 아니다. irrelevant/stale context가 늘어나면 중요한 constraint와 현재 상태의 signal이 희석될 수 있다.

Q. 장기 지식도 버려야 하는가?  
A. 아니다. 장기 저장소에 보관하고 현재 작업에 필요한 부분만 retrieval하는 것이 핵심이다.

Q. 작은 작업단위가 context engineering과 무슨 관계인가?  
A. 한 번에 필요한 코드·결정·검증 범위를 줄여 active context의 signal-to-noise ratio를 높인다.

Q. worktree는 왜 도움이 되는가?  
A. 병렬 agent의 filesystem state를 격리해 서로의 미완성 변경을 context처럼 잘못 읽는 문제를 줄인다.

## Related

- Working Memory
- Retrieval
- Agent Memory
- Worktree Isolation
- Rolling Checkpoint
- AI-Assisted Engineering

## Sources

- InfoQ / QCon London, *The Right 300 Tokens Beat 100k Noisy Ones: The Architecture of Context Engineering*  
  https://www.infoq.com/presentations/architecture-context-engineering/
- Educative newsletter, *Why your coding agent breaks at turn 50* (2026-08-29)
