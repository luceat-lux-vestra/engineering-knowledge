# Formal Methods Thinking

- Status: seed
- Added: 2026-11-18
- Source month: 2026-10

## 한 줄 요약

Formal Methods의 실무적 가치는 도구부터 배우는 것이 아니라, **system property와 environment assumption을 명확히 하고 가능한 state/interleaving을 적대적으로 상상하는 습관**에 있다.

## 왜 중요한가

분산·동시성 시스템의 버그는 happy path 구현보다 다음에서 많이 생긴다.

- message reorder
- retry
- crash between steps
- timeout after side effect
- duplicated delivery
- partial network partition
- stale read
- concurrent ownership change

코드를 쓰고 나서 이런 경우를 찾는 것보다 설계 단계에서 property와 state space를 먼저 공격하면 더 싸게 결함을 찾을 수 있다.

## 핵심 개념

- invariant / property
- environment assumption
- state space
- interleaving
- adversarial nondeterminism
- safety
- liveness
- model checking mindset

## 내가 이해한 예

설계가:

~~~text
1. DB write A
2. DB write B
3. event publish C
~~~

라면 순차적으로 읽는 대신 이렇게 공격한다.

~~~text
A 성공
→ process crash

C 실제 publish 성공
→ response timeout
→ retry

B와 C 순서 뒤집힘

두 worker가 동시에 같은 aggregate 처리
~~~

"가능한 순서가 정해져 있지 않다면 가장 나쁜 순서가 발생할 수 있다"고 보는 것이 adversarial nondeterminism의 감각이다.

## 먼저 property를 쓴다

예:

~~~text
Safety:
결제는 한 주문에 한 번만 최종 반영된다.

Liveness:
retry 가능한 실패라면 결국 terminal state에 도달한다.

Environment assumption:
PG callback은 중복될 수 있고 순서가 뒤집힐 수 있다.
~~~

이 세 줄이 없으면 구현을 보고도 무엇이 "틀린 상태"인지 판단하기 어렵다.

## Formal tool 없이도 쓸 수 있다

TLA+, Alloy, model checker를 바로 도입하지 않아도 다음 질문만으로 도움이 된다.

- 반드시 항상 참이어야 하는 것은 무엇인가?
- 외부 시스템은 무엇을 보장하지 않는가?
- 어느 두 step 사이에서 crash하면 위험한가?
- 두 actor가 같은 일을 동시에 하면?
- response가 사라졌지만 side effect는 성공했다면?

## 헷갈리는 점

- 언제 mental model을 넘어서 TLA+/model checker까지 써야 하는가?
- state space를 너무 크게 만들지 않고 핵심 invariant만 검증하는 방법은?
- business invariant와 implementation invariant를 어떻게 분리하는가?

## 다시 떠올리기

Q. Formal Methods 사고의 시작점은?  
A. 구현 코드가 아니라 보장해야 할 property와 환경 가정을 명시하는 것이다.

Q. Adversarial nondeterminism이란?  
A. 순서가 보장되지 않는 것은 가장 불리한 순서로 발생할 수 있다고 가정하는 사고법이다.

Q. 도구를 쓰지 않아도 가치가 있는가?  
A. 있다. failure/interleaving 질문 자체가 설계 결함을 조기에 드러낸다.

## Related

- State Machine
- Idempotency
- Distributed Systems
- Progressive Collapse
- Recovery Semantics

## Sources

- InfoQ / QCon, *How to Find Resilience Bugs in Systems that Don't Exist*  
  https://www.infoq.com/presentations/formal-methods-principles/
