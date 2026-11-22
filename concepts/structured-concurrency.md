# Structured Concurrency

- Status: seed
- Added: 2026-11-18
- Source month: 2026-10

## 한 줄 요약

Structured Concurrency는 여러 concurrent child task를 **하나의 수명주기를 가진 작업 단위**로 묶어, 성공·실패·취소·종료 관계를 구조적으로 보장하는 동시성 모델이다.

## 왜 중요한가

전통적인 Future/Executor 기반 코드는 child task를 시작한 뒤 parent scope와 별개로 살아남게 만들기 쉽다.

그 결과 다음 문제가 생길 수 있다.

- 하나의 child가 실패했는데 나머지는 계속 실행된다.
- parent가 이미 끝났는데 background task가 남는다.
- 실패 전파와 cancel 정책이 코드 곳곳에 흩어진다.
- 어떤 task가 누구의 lifetime에 속하는지 불명확하다.

Structured Concurrency는 이런 관계를 lexical scope 안에 넣는다.

## 핵심 개념

- task scope
- parent / child lifetime
- failure propagation
- cancellation
- join policy
- virtual thread
- structured cleanup
- fail-fast

## 내가 이해한 예

~~~text
request
 ├─ fetch user
 ├─ fetch order
 └─ fetch permission
~~~

세 작업이 모두 request 하나를 완성하기 위한 child라면 다음 invariant가 자연스럽다.

~~~text
하나 실패
→ 나머지 cancel
→ parent 실패

parent scope 종료
→ unfinished child가 남지 않음
~~~

기존 방식에서는 이 정책을 Future마다 수동으로 구현하기 쉽고 누락도 쉽다.

Structured Concurrency에서는 task tree 자체가 ownership을 표현한다.

## Virtual Threads와의 관계

Virtual Thread는 blocking task를 싸게 실행하게 한다.

Structured Concurrency는 그 task 여러 개를 **어떻게 묶고, 기다리고, 취소하고, 실패를 전파할지**를 다룬다.

따라서 둘은 대체 관계가 아니다.

~~~text
Virtual Thread
= cheap concurrency primitive

Structured Concurrency
= concurrency lifetime / failure structure
~~~

## 현재 Java 상태

JEP 543은 Structured Concurrency를 JDK 28에 final API로 통합했다.

JDK 28 GA는 2027년 3월 예정이므로, 2026-11 현재 production baseline에 바로 쓸 수 있는 일반 GA 기능이라는 뜻은 아니다.

## 헷갈리는 점

- timeout policy를 task tree 전체와 개별 child 중 어디에 둘 것인가?
- partial success를 허용하는 fan-out 작업은 어떤 Joiner policy가 적합한가?
- request scope 밖의 long-running background task는 structured concurrency와 어떻게 경계를 나누는가?

## 다시 떠올리기

Q. Structured Concurrency가 해결하려는 핵심 문제는?  
A. concurrent task의 lifetime과 failure 관계를 parent-child 구조로 명시하는 것이다.

Q. Virtual Thread와 같은 개념인가?  
A. 아니다. Virtual Thread는 실행 비용, Structured Concurrency는 task 구조와 lifecycle을 다룬다.

Q. parent scope가 끝났는데 child가 계속 살아있는 상황을 왜 피하려는가?  
A. ownership과 cleanup이 불명확해지고 failure/cancellation 누수가 생기기 때문이다.

## Related

- [Virtual Threads](./virtual-threads.md)
- ScopedValue
- Cancellation
- Fail-Fast
- Fan-Out / Fan-In

## Sources

- InfoQ, *JEP 543 Finalizes Structured Concurrency in JDK 28, Ending Seven Preview Rounds*  
  https://www.infoq.com/news/2026/10/jep-543-jdk-28/
