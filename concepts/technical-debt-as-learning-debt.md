# Technical Debt as Learning Debt

- Status: seed
- Added: 2026-11-18
- Source month: 2026-11

## 한 줄 요약

Technical debt는 항상 나쁜 설계의 결과가 아니라, **software를 실제로 사용하며 새로 배운 것과 과거 코드가 표현하는 이해 사이의 차이**에서 생길 수 있다.

## 왜 중요한가

처음 구현할 때는 현재 정보 안에서 합리적인 설계를 했더라도 production traffic, user behavior, 운영 장애, 새로운 요구를 경험하면서 domain 이해가 바뀐다.

그런데 code와 architecture가 예전 이해를 계속 유지하면 gap이 생긴다.

~~~text
과거의 이해
   ↓
implementation
   ↓
production / user feedback
   ↓
새로운 이해

새로운 이해 != 현재 implementation
              ↓
          technical debt
~~~

따라서 모든 debt를 "예전에 대충 만든 코드"라고 해석하면 왜 생겼는지 잘못 진단할 수 있다.

## 핵심 개념

- technical debt
- learning by doing
- sociotechnical system
- shared understanding
- architecture evolution
- organizational memory
- AI-generated code
- code comprehension

## 내가 이해한 예

초기에는:

~~~text
하나의 payment status면 충분하다
~~~

고 판단해 설계했다.

운영하면서:

~~~text
transport failure
!= provider failure
!= business failure

UNKNOWN / RETRY_PENDING / MANUAL_REVIEW가 필요
~~~

하다는 사실을 배웠다면 기존 단순 status 모델은 당시에는 합리적이었더라도 지금은 debt가 된다.

중요한 것은 누가 잘못했는지를 찾는 것이 아니라 **새로 배운 사실을 software model에 반영하는 것**이다.

## AI가 debt를 키울 수 있는 이유

AI coding으로 implementation throughput이 shared understanding 형성 속도보다 빨라지면:

~~~text
code production ↑↑
team comprehension ↑
        ↓
gap 확대
~~~

가 될 수 있다.

특히 사람이 reasoning과 trade-off를 충분히 읽지 않은 상태에서 code만 빠르게 축적되면 미래 변경 시점에 hidden assumption을 다시 발굴해야 한다.

따라서 AI 시대의 technical debt에는 code quality뿐 아니라 다음도 포함된다.

- 왜 이 구조를 택했는지 모름
- 어떤 invariant를 보존해야 하는지 모름
- decision history가 없음
- code ownership/understanding이 약함

## 헷갈리는 점

- learning-driven debt와 단순 품질 결함을 어떻게 구분할 것인가?
- 새로운 이해가 생겼다고 언제 architecture 변경 비용을 지불할 것인가?
- decision record가 debt 발생 자체를 줄이는지, 단지 상환 비용만 줄이는지?

## 다시 떠올리기

Q. Technical debt는 항상 잘못 만든 코드인가?  
A. 아니다. 과거에는 합리적이었지만 새로운 학습으로 현재 모델이 낡아질 수도 있다.

Q. Debt를 갚는다는 것은 무엇인가?  
A. 새롭게 얻은 domain/operational knowledge를 software model과 architecture에 다시 반영하는 것이다.

Q. AI coding이 왜 debt를 증가시킬 수 있는가?  
A. implementation 속도가 팀의 이해와 ownership 형성 속도보다 빨라질 수 있기 때문이다.

## Related

- Architecture Evolution
- [Agent Context Engineering](./agent-context-engineering.md)
- Documentation
- ADR
- Sociotechnical Systems

## Sources

- InfoQ, *Technical Debt Is Social; It Is the Price of Learning by Doing*  
  https://www.infoq.com/news/2026/11/tech-debt-learning-doing/
