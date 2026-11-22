# Progressive Delivery for Foundational Platforms

- Status: seed
- Added: 2026-11-18
- Source month: 2026-09

## 한 줄 요약

회사 전체가 의존하는 foundational platform은 일반 product service보다 **더 작은 blast radius로 천천히 배포하고, 실제 사용자 흐름을 흉내 낸 synthetic workflow로 깊게 관찰**해야 한다.

## 왜 중요한가

일반 application team은 CI 통과 후 빠른 production deployment가 합리적일 수 있다.

하지만 compute, database, networking, observability ingestion처럼 장애가 나면 다수 서비스가 동시에 영향을 받는 foundational platform은 변경 실패의 blast radius가 훨씬 크다.

따라서 동일한 CD 속도를 목표로 삼기보다 **안전한 iteration 방법** 자체를 설계해야 한다.

## 핵심 개념

- foundational platform
- blast radius
- progressive deployment
- synthetic monitoring
- production validation
- canary / staged rollout
- deep observation
- time as a failure detector

## 내가 이해한 예

일반 서비스:

~~~text
CI
 ↓
deploy
 ↓
application metrics
~~~

foundational platform:

~~~text
CI
 ↓
실제 고객을 흉내 낸 synthetic workflow
 ↓
아주 작은 production slice
 ↓
충분한 관찰 시간
 ↓
다음 slice
 ↓
점진 확대
~~~

여기서 synthetic monitoring은 단순 GET /health가 아니다.

예를 들어 data platform이라면:

~~~text
cluster 생성
→ 실제 job 실행
→ 결과 확인
→ cluster 종료
~~~

처럼 고객이 사용하는 vertical workflow 전체를 수행하는 테스트가 더 유용하다.

## 왜 시간도 검증 도구인가

foundational platform은 짧은 test suite에서 잡히지 않는 문제를 가질 수 있다.

- resource leak
- delayed failure
- rare race
- scale-dependent behavior
- long-tail traffic interaction

따라서 빠른 rollout보다 **작게 배포한 뒤 충분히 관찰하는 시간** 자체가 검증 과정이 된다.

## 헷갈리는 점

- rollout slice를 어느 단위로 나누는 것이 좋은가?
- synthetic workflow가 production side effect를 만들지 않게 어떻게 격리하는가?
- 느린 rollout과 변경 lead time 사이의 균형을 어떻게 측정하는가?

## 다시 떠올리기

Q. Foundational platform의 핵심 차이는?  
A. 실패하면 특정 기능이 아니라 많은 서비스나 비즈니스 자체가 동시에 영향을 받을 수 있다는 점이다.

Q. Synthetic monitoring은 health check와 무엇이 다른가?  
A. 실제 고객처럼 end-to-end workflow를 수행해 platform의 실제 사용 경로를 검증한다.

Q. 왜 rollout을 천천히 해야 하는가?  
A. 작은 blast radius를 유지하면서 시간에 따라 드러나는 문제를 관찰하기 위해서다.

## Related

- [Progressive Collapse](../concepts/progressive-collapse.md)
- Canary Deployment
- Synthetic Monitoring
- Blast Radius
- Continuous Delivery

## Sources

- InfoQ / QCon, *Continuous Delivery for Foundational Platforms*  
  https://www.infoq.com/presentations/cd-reliability-innovation/
