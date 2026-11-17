# End-to-End Latency Optimization

- Status: seed
- Added: 2026-11-18
- Source month: 2026-10

## 한 줄 요약

Latency 최적화는 component 하나를 빠르게 만드는 문제보다 **사용자가 실제로 기다리는 end-to-end path에서 일을 줄이고, 더 일찍 시작하고, dependency를 제거하는 문제**에 가깝다.

## 왜 중요한가

backend API p50/p99가 좋아져도 사용자가 첫 화면을 보는 시간은 그대로일 수 있다.

실제 request path에는 다음이 함께 존재한다.

- retrieval
- hydration
- ranking
- ad lookup
- serialization
- network
- image fetch
- frontend render

따라서 component-local metric만 최적화하면 전체 체감 latency에 거의 영향이 없을 수 있다.

## 핵심 개념

- end-to-end latency
- critical path
- above-the-fold
- hydration
- parallelization
- dependency elimination
- hedged request
- do less work
- measure / identify / fix / validate

## 내가 이해한 예

기존:

~~~text
candidate 50,000개 retrieval
        ↓
전부 hydration
        ↓
ranking
        ↓
상위 50개만 사용
~~~

실제로는 대부분 버릴 data까지 비싼 hydration을 한 것이다.

개선:

~~~text
cheap retrieval/filter
        ↓
필요한 candidate만 hydration
        ↓
ranking
        ↓
presentation data는 별도
~~~

즉 같은 일을 더 빠르게 하는 것보다 **하지 않아도 되는 일을 제거하는 것**이 더 큰 최적화가 될 수 있다.

## 사용자 기준 KPI를 잡는다

Uber Eats 사례에서는 backend API latency보다 첫 화면 결과가 이미지와 함께 준비되는 Above-the-Fold completion을 주요 지표로 삼았다.

이 관점은:

~~~text
"서버는 100ms 빨라졌다"
~~~

보다:

~~~text
"사용자가 기다린 시간은 실제로 줄었는가?"
~~~

를 우선한다.

## 반복해서 쓸 수 있는 네 가지 질문

1. 이 일 자체를 하지 않아도 되는가?
2. 더 일찍 시작할 수 있는가?
3. 병렬화할 수 있는가?
4. dependency 하나를 없앨 수 있는가?

그 뒤에 low-level 최적화를 한다.

## 헷갈리는 점

- component latency와 end-to-end latency contribution을 어떻게 정확히 분해하는가?
- hedged request가 tail latency를 줄이지만 downstream load를 늘리는 지점은 어디인가?
- 사용자 KPI와 backend SLO를 어떻게 연결하는가?

## 다시 떠올리기

Q. Latency 최적화의 첫 질문은 "어떻게 더 빠르게?"인가?  
A. 아니다. "이 일을 아예 줄이거나 없앨 수 있는가?"가 먼저일 수 있다.

Q. component metric이 좋아져도 사용자가 못 느낄 수 있는 이유는?  
A. 그 component가 전체 critical path의 작은 부분이거나 다른 dependency가 병목일 수 있기 때문이다.

Q. Uber Eats 사례의 핵심 사고법은?  
A. do less work, start work earlier, remove dependencies, user-visible completion을 측정하는 것이다.

## Related

- P99
- Critical Path
- Hedged Request
- Backpressure
- Micro-Batching

## Sources

- InfoQ, *Uber Eats Rebuilds Search Pipeline to Cut End-to-End Latency by 50%*  
  https://www.infoq.com/news/2026/10/uber-eats-search-latency/
