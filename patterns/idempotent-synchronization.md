# Idempotent Synchronization

- Status: seed
- Added: 2026-11-17
- Source month: 2026-08

## 한 줄 요약

두 시스템을 안정적으로 동기화하려면 기술 선택보다 먼저 **누가 authoritative owner인지**, 그리고 같은 write가 여러 번 와도 안전한지부터 결정해야 한다.

## 왜 중요한가

"A에서 읽어 B에 쓰면 된다"는 동기화는 실제 운영에서 retry, 중복, 양방향 수정, 부분 실패, 지연, 누락 때문에 쉽게 깨진다.

특히 양쪽 시스템이 같은 entity를 자유롭게 수정하게 두고 `last-write-wins`로 해결하면 충돌 처리가 핵심 시스템이 되어버린다.

## 핵심 개념

- authoritative owner / source of truth
- idempotent write
- stable business key
- change detection
- retryable queue
- drift detection
- dead-letter queue
- observability / audit

## 내가 이해한 예

고객 주소를 CRM과 Billing 양쪽에서 수정할 수 있다고 하자.

나쁜 구조:

```text
CRM ──write──> Billing
CRM <──write── Billing
```

둘 다 owner라면 동시에 수정됐을 때 "어느 값이 맞는가"를 synchronization layer가 판단해야 한다.

더 단순한 구조:

```text
CRM = customer profile owner
        ↓
 idempotent sync
        ↓
Billing = replica / consumer
```

같은 customer update가 3번 전달돼도 `customer_id + version` 같은 stable identity로 결과가 한 번 적용된 것과 같아야 한다.

변경 탐지는 가능하면 싼 수단부터 사용한다.

```text
change log / updated_at
        ↓
hash comparison
        ↓
full compare
```

## 헷갈리는 점

- entity마다 ownership을 나누는 경우 cross-entity transaction은 어떻게 다뤄야 하는가?
- 양방향 동기화가 정말 필요한 경우 conflict resolution policy를 어디까지 일반화할 수 있는가?
- business idempotency와 transport-level deduplication의 경계는?

## 다시 떠올리기

Q. synchronization에서 첫 질문은 무엇인가?  
A. "이 데이터의 authoritative owner는 누구인가?"

Q. retry를 안전하게 만들기 위한 기본 속성은?  
A. write operation의 idempotency.

Q. 동기화가 조용히 망가지는 것을 어떻게 찾는가?  
A. drift metric, heartbeat, DLQ, audit/observability 같은 별도 탐지 경로가 필요하다.

## Related

- Idempotency
- Eventual Consistency
- Outbox Pattern
- Ownership Boundary

## Sources

- DZone, *Designing a Reliable Data Synchronization Layer: Idempotency, Ownership, and Observability*  
  https://dzone.com/articles/data-sync-design
