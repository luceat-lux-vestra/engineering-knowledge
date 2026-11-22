# Object Storage as a Durable Log

- Status: seed
- Added: 2026-11-18
- Source month: 2026-10

## 한 줄 요약

모든 event stream이 millisecond latency를 필요로 하는 것은 아니며, **더 높은 latency를 받아들이면 object storage를 durable log의 중심으로 사용해 비용·durability·elasticity를 얻을 수 있다.**

## 왜 중요한가

Kafka류 broker는 낮은 latency와 높은 throughput을 위해 dedicated cluster와 local/durable log 구조를 운영한다.

하지만 다음 workload라면 다른 trade-off가 가능하다.

- event delivery가 수백 ms~수초여도 된다.
- storage durability가 매우 중요하다.
- workload가 bursty하다.
- broker fleet를 상시 운영하고 싶지 않다.
- object storage economics가 더 중요하다.

Cloudflare K2는 R2 object storage 위에 partitioned durable log를 구현한 사례다.

## 핵심 개념

- durable log
- object storage
- partition
- append path
- serverless streaming
- latency / cost trade-off
- elasticity
- storage-compute separation

## 내가 이해한 예

Kafka류:

~~~text
producer
  ↓
broker memory / local disk
  ↓
replicated log
  ↓
consumer

장점: 낮은 latency
대가: broker infrastructure
~~~

Object-storage log:

~~~text
producer
  ↓
durable append layer
  ↓
object storage
  ↓
consumer

장점: durability / cost / elastic storage
대가: 더 높은 latency
~~~

K2 공개 사례에서는 p99 produce latency를 약 1초 수준으로 설명한다.

즉 "Kafka보다 느리다"가 실패가 아니라 **workload가 허용하는 latency budget을 storage economics와 교환한 설계**다.

## 언제 어울리지 않는가

- sub-millisecond 또는 low-single-digit ms latency가 핵심인 경우
- high-frequency request/reply coordination
- consumer가 극도로 빠른 tailing을 요구하는 경우
- ordering semantics를 object-storage layer에서 감당하기 어려운 경우

## 헷갈리는 점

- object write granularity와 small-object amplification은 어떻게 제어하는가?
- partition hot spot은 어떤 방식으로 분산하는가?
- consumer offset/checkpoint는 별도 metadata plane에 저장하는가?
- exactly-once에 가까운 semantics를 어디까지 제공할 수 있는가?

## 다시 떠올리기

Q. Object storage를 log에 쓰는 핵심 조건은?  
A. 낮은 latency보다 durability, elasticity, cost가 더 중요한 workload여야 한다.

Q. Kafka를 대체한다는 뜻인가?  
A. 아니다. latency/operations trade-off가 다른 별도 설계점이다.

Q. K2 사례가 보여주는 가장 중요한 점은?  
A. streaming architecture도 workload latency budget에 따라 storage substrate를 다르게 선택할 수 있다는 점이다.

## Related

- Kafka
- [Durable Workflow](../systems/durable-workflow.md)
- Event Streaming
- Storage Tiering
- Backlog Age

## Sources

- InfoQ, *Cloudflare K2 Builds Event Streams on R2 Object Storage, at a Second of Produce Latency*  
  https://www.infoq.com/news/2026/10/cloudflare-k2-serverless-streams/
