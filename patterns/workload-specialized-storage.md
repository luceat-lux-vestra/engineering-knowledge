# Workload-Specialized Storage

- Status: seed
- Added: 2026-11-18
- Source month: 2026-09

## 한 줄 요약

업무 invariant와 access pattern이 충분히 명확하다면, 범용 데이터베이스의 guarantee를 전부 유지하는 것보다 **실제 workload에 필요한 기능만 남긴 specialized storage**가 훨씬 단순하고 빠를 수 있다.

## 왜 중요한가

범용 managed database는 다양한 workload를 지원하기 위해 replication, consistency, transaction, partitioning, failover 같은 넓은 기능을 제공한다.

하지만 특정 serving workload가 그 guarantee를 실제로 필요로 하지 않으면 비용과 latency를 위해 불필요한 복잡성을 계속 지불하게 된다.

Perplexity의 CobbleDB 사례는 검색 serving이라는 좁은 workload에 맞춰 storage를 다시 설계한 사례다.

## 핵심 개념

- workload-specific storage
- access pattern
- batch read
- local NVMe
- async replication
- eventual consistency
- hedged read
- AZ affinity
- hot path / durable path separation

## 내가 이해한 예

검색 serving workload:

~~~text
query 1개
→ page key 약 100~120개
→ 여러 key를 batch read
→ record당 비교적 큰 payload
→ 매우 높은 read QPS
~~~

여기서 핵심 invariant가:

- read가 압도적으로 많다.
- slight replication lag를 허용할 수 있다.
- global transaction은 필요하지 않다.
- durable source는 별도로 존재한다.

라면 hot serving layer는 범용 DB와 다른 선택을 할 수 있다.

~~~text
Durable storage
    ↓ batch export
S3 / batch handoff
    ↓
CobbleDB
  ├─ local NVMe
  ├─ RocksDB MultiGet
  ├─ async replica update
  ├─ AZ-affine routing
  └─ hedged read
~~~

즉 "DB를 직접 만들면 빠르다"가 핵심이 아니라 **필요 없는 guarantee를 버릴 수 있을 만큼 workload invariant를 정확히 알고 있었기 때문에 최적화가 가능했다**는 점이 중요하다.

## 공개 사례에서의 결과

Perplexity가 공개한 생산 환경 수치에서는 DynamoDB 대비 batch-read latency가 크게 감소했다.

- median: 약 31.4ms → 5.6ms
- p99: 약 123ms → 24.2ms

하지만 그 대가로 node lifecycle, backup verification, partition rebalancing 등의 운영 책임을 직접 가져왔다.

## 헷갈리는 점

- 어느 시점에 managed DB의 비용보다 자체 storage 운영 비용이 작아지는가?
- eventual consistency 허용 여부를 business invariant로 어떻게 명시하는가?
- specialized store가 두 번째 범용 플랫폼으로 성장하는 것을 어떻게 막는가?

## 다시 떠올리기

Q. 범용 DB를 버린 이유는 단순히 성능 때문인가?  
A. 아니다. workload가 요구하지 않는 guarantee와 운영 모델에 비용을 지불하고 있었기 때문이다.

Q. Specialized storage 설계의 선행조건은?  
A. access pattern과 consistency/transaction invariant를 매우 정확히 알아야 한다.

Q. 가장 큰 대가는?  
A. managed service가 대신하던 운영 책임을 직접 가져온다는 점이다.

## Related

- Eventual Consistency
- Hedged Request
- Storage Tiering
- RocksDB
- Workload Characterization

## Sources

- InfoQ, *Home Made CobbleDB Replaces DynamoDB at Perplexity to Cut Query Latency 5x and Reduce Cloud Storage*  
  https://www.infoq.com/news/2026/09/cobbledb-perplexity/
