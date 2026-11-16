# Progressive Collapse

- Status: seed
- Added: 2026-11-17
- Source month: 2026-08

## 한 줄 요약

개별 component 하나의 failure가 **연결 관계와 부하 전달을 통해 주변 component를 차례로 무너뜨려 전체 시스템 장애로 확대되는 현상**이다.

## 왜 중요한가

"각 서비스가 각각 충분히 안정적이다"와 "전체 시스템이 장애를 견딘다"는 다른 문제다.

분산 시스템에서는 timeout, retry, shared dependency, autoscaling, connection pool 같은 연결 메커니즘이 오히려 failure를 주변으로 전파할 수 있다.

## 핵심 개념

- cascading failure
- blast radius
- failure isolation
- bulkhead
- bounded retry
- circuit breaker
- load shedding
- shared dependency
- system property vs component property

## 내가 이해한 예

```text
Service A 장애
     ↓
B의 요청 지연
     ↓
client retry 증가
     ↓
B/C connection pool 고갈
     ↓
timeout 증가
     ↓
더 많은 retry
     ↓
전체 시스템 붕괴
```

A 하나의 장애 자체보다 **retry와 shared resource를 통한 증폭 경로**가 문제다.

따라서 resilience는 단순히 A를 더 강하게 만드는 것만으로 해결되지 않는다.

```text
failure isolation
+ bounded retries
+ load shedding
+ bulkhead
+ dependency reduction
```

처럼 failure propagation path를 끊어야 한다.

## 헷갈리는 점

- circuit breaker와 load shedding 중 어떤 것을 먼저 적용해야 하는가?
- retry budget을 시스템 전체 수준에서 어떻게 설계하는가?
- 공용 DB/queue처럼 완전히 분리하기 어려운 dependency의 blast radius는 어떻게 줄이는가?

## 다시 떠올리기

Q. component reliability와 system resilience가 왜 다른가?  
A. component가 각각 안정적이어도 연결 구조가 failure를 증폭하면 전체 시스템은 쉽게 무너질 수 있다.

Q. retry는 항상 resilience 기능인가?  
A. 아니다. 제한되지 않은 retry는 장애 시 추가 부하를 만들어 collapse를 가속할 수 있다.

Q. 핵심 설계 목표는?  
A. failure가 다른 영역으로 전파되는 경로와 blast radius를 제한하는 것.

## Related

- Bulkhead
- Circuit Breaker
- Backpressure
- Load Shedding
- Retry Budget
- State-Space Remediation

## Sources

- InfoQ, *Understanding Progressive Collapse: How To Avoid A Cascading Failure*  
  https://www.infoq.com/presentations/progressive-collapse-system-resilience/
