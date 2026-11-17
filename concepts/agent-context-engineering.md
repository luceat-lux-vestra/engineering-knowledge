# Agent Context Engineering

- Status: learning
- Added: 2026-11-17
- Source month: 2026-08~09

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

## Durable receipt: 다음 session이 상태를 재구성할 수 있어야 한다

긴 작업에서 중요한 것은 모델이 이전 session을 "기억하는 것"이 아니라 **fresh session이 외부 artifact만 보고 현재 상태를 재구성할 수 있는 것**이다.

Anthropic의 long-running agent harness 사례에서는 다음과 같은 artifact를 사용했다.

~~~text
feature list
progress file
git history
test result
init script
~~~

각 session은:

~~~text
현재 상태 읽기
→ 아직 끝나지 않은 feature 하나 선택
→ 구현
→ end-to-end 검증
→ progress file 갱신
→ commit
~~~

처럼 동작한다.

좋은 checkpoint/receipt의 판단 기준은 단순하다.

> 이전 대화와 모델 memory를 전혀 주지 않아도, 새 session이 artifact만 읽고 무엇이 끝났고 무엇이 남았는지 정확히 복원할 수 있는가?

이런 receipt는 context compaction의 대체물이 아니라 **session boundary를 견디는 durable state**다.

## Context compression은 retrieval과 다른 최적화다

필요한 정보를 선택해서 넣는 것 외에, 반복되는 긴 system context 자체를 더 짧은 representation으로 바꾸는 방법도 있다.

Shopify의 Gisting 사례에서는 약 6,000 token system prompt를 약 1,500 learned gist token으로 압축하면서 같은 behavior를 유지하도록 학습했다.

이건 일반적인 요약과 다르다.

~~~text
full prompt
   ↓ teacher behavior
learned gist tokens
   ↓
같은 behavior를 최대한 재현
~~~

따라서 context engineering에는 서로 다른 층이 있다.

- 무엇을 넣을지 고르는 retrieval / selection
- session 간 상태를 남기는 durable receipt
- 반복되는 고정 context를 줄이는 compression

이 셋을 같은 문제로 취급하지 않는 것이 중요하다.

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
- Anthropic Engineering, *Effective harnesses for long-running agents*  
  https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- Shopify Engineering, *Gisting: Compressing LLM Agent context to ↑ throughput and ↓ cost*  
  https://shopify.engineering/gisting
