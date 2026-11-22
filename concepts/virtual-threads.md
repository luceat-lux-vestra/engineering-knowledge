# Virtual Threads

- Status: seed
- Added: 2026-11-17
- Source month: 2026-08

## 한 줄 요약

Virtual Thread는 **thread를 싸게 만드는 기술**이지, DB connection이나 downstream API 같은 실제 자원의 처리량을 늘려주는 기술은 아니다.

## 왜 중요한가

기존 servlet thread pool은 의도하지 않아도 동시성 상한 역할을 했다. Virtual Thread를 도입하면 이 암묵적 admission control이 사라질 수 있어, 병목이 DB connection pool·외부 API·file descriptor 같은 다음 자원으로 이동한다.

JDK 24의 JEP 491로 `synchronized` 블록에서 carrier thread가 pinning되던 대표 문제가 크게 줄었지만, Virtual Thread 도입 이후에는 오히려 **bounded resource를 애플리케이션이 명시적으로 제한해야 하는 문제**가 더 중요해진다.

## 핵심 개념

- Virtual Thread / carrier thread
- pinning과 JEP 491
- explicit resource bounding
- connection pool / downstream rate limit
- `Semaphore`
- `ThreadLocal` 재사용 가정의 붕괴
- `ScopedValue`
- backpressure와 WebFlux의 차이

## 내가 이해한 예

기존 Tomcat worker thread가 200개라면, 동시에 처리 중인 blocking request 수도 대략 그 범위 안에 묶인다.

```text
platform threads 200
        ↓
DB pool 50
```

Virtual Thread로 요청 10,000개가 동시에 진입 가능해지면 thread 생성 비용은 문제가 아니어도 DB는 여전히 50 connection뿐이다.

```text
virtual threads 10,000
        ↓
DB pool 50  ← 진짜 병목
```

따라서 필요한 것은 "Virtual Thread를 켰으니 끝"이 아니라 DB/API 등 각 bounded resource 앞의 명시적인 동시성 제어다.

또 `ThreadLocal`을 "thread가 오래 살아있으니 비싼 객체를 캐시한다"는 용도로 사용했다면 Virtual Thread에서는 요청마다 thread가 새로 만들어져 캐시 효과가 사라질 수 있다.

## 헷갈리는 점

- `Semaphore` 같은 동시성 제한을 어느 계층에 두는 것이 가장 자연스러운가?
- connection pool 자체의 대기열과 application-level semaphore를 둘 다 두는 기준은?
- blocking MVC + Virtual Thread와 WebFlux를 구분하는 실전 기준은 어디인가?

## 다시 떠올리기

Q. Virtual Thread가 DB 처리량을 늘리는가?  
A. 아니다. blocking thread 비용을 낮출 뿐 DB connection 수나 DB 자체 처리량은 그대로다.

Q. Virtual Thread 적용 후 병목은 어디로 가는가?  
A. connection pool, rate-limited API, file descriptor 같은 실제 bounded resource로 이동할 수 있다.

Q. Virtual Thread가 WebFlux를 완전히 대체하는가?  
A. 아니다. streaming/SSE/WebSocket처럼 backpressure가 중요한 모델은 여전히 reactive model의 강점이 있다.

## Related

- [Progressive Collapse](./progressive-collapse.md)
- Backpressure
- Connection Pool
- Load Shedding

## Sources

- InfoQ, *Virtual Threads after JDK 24: What Changed for Production Java*  
  https://www.infoq.com/articles/virtual-threads-after-jdk24/
