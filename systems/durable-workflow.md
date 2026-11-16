# Durable Workflow

- Status: learning
- Added: 2026-11-17
- Source month: 2026-07~08

## 한 줄 요약

Durable Workflow는 여러 단계에 걸친 업무의 **진행 상태 자체를 영속화**해서, 프로세스·worker·pod가 죽어도 논리적인 실행을 이어갈 수 있게 하는 실행 모델이다.

## 왜 중요한가

하나의 DB transaction으로 끝낼 수 없는 업무는 보통 다음 문제를 직접 구현하게 된다.

- 어디까지 성공했는가?
- 실패한 step만 다시 실행할 수 있는가?
- 3시간/3일 기다렸다가 이어서 실행할 수 있는가?
- 외부 API가 이미 성공한 뒤 worker가 죽으면 어떻게 중복을 막는가?
- deploy/restart 후 workflow instance를 어떻게 복원하는가?

Temporal, DBOS 같은 시스템은 이 문제를 framework/runtime 차원에서 다룬다.

## 핵심 개념

- workflow / step / activity
- durable execution
- checkpoint 또는 event history
- replay
- deterministic orchestration
- idempotent external side effect
- durable timer / signal
- workflow state vs batch checkpoint

## 내가 이해한 예

주문 처리:

```text
결제 승인
  ↓
재고 확보
  ↓
배송 요청
  ↓
배송 완료 이벤트 대기
  ↓
포인트 지급
```

일반 코드에서는 결제 성공 직후 서버가 죽었을 때 "재고부터 다시 할지, 결제도 다시 할지"를 직접 관리해야 한다.

Durable Workflow에서는 완료된 단계와 결과를 runtime이 기억한다.

```text
payment    DONE
inventory  DONE
shipping   WAITING
```

새 worker가 떠도 이미 완료된 단계를 무조건 다시 수행하는 대신 저장된 history/checkpoint를 이용해 이어간다.

단, 외부 PG 호출 자체가 자동으로 exactly-once가 되는 것은 아니다. 외부 side effect는 여전히 idempotency key 같은 별도 보호가 필요하다.

## Temporal / DBOS / Batch의 감각적 차이

```text
Temporal
- event history + deterministic replay
- 장기 business process orchestration

DBOS
- Postgres 중심의 durable step/checkpoint
- 별도 orchestrator를 줄인 lightweight durable execution

Spring Batch / OxideBatch
- bounded dataset processing
- job/step/chunk checkpoint와 restartability
```

가장 단순한 구분은 다음과 같다.

> 처리할 **데이터가 주인공이면 Batch**, 진행 중인 **업무 상태가 주인공이면 Durable Workflow**.

## Durable runtime과 빠른 eval runtime은 분리할 수 있다

Durability를 얻으려면 production runtime은 보통 각 step의 상태·결과·retry 정보 등을 저장하고, 필요하면 task를 분산하고, crash/restart 후 실행을 복원해야 한다.

이 machinery는 production에서는 가치가 있지만 **빠르게 수십~수백 번 돌려보는 local test/evaluation loop에서는 오히려 비용**이 될 수 있다.

특히 AI workflow처럼 결과 품질을 반복 평가해야 하는 경우:

```text
Workflow business logic
        │
        ├─ production
        │    └─ durable runtime
        │         persistence / retry / distribution / recovery
        │
        └─ local eval
             └─ lightweight runtime
                  fast reset / fast iteration
```

처럼 **workflow 정의와 execution runtime을 분리**하면 같은 논리 흐름을 서로 다른 실행 환경에서 사용할 수 있다.

핵심은 durability를 제거하는 것이 아니라, durability 관련 infrastructure concern이 business workflow 자체에 과도하게 침투하지 않도록 경계를 두는 것이다.

이 관점은 batch framework에도 연결된다. restart/checkpoint semantics는 보존하되, workload의 핵심 처리 로직과 metadata persistence/runtime 구현이 지나치게 결합되면 테스트와 대체 runtime 구성이 어려워질 수 있다.

## 헷갈리는 점

- Temporal의 event replay와 DBOS의 step checkpoint가 failure semantics에서 정확히 어떻게 다른가?
- Durable Workflow와 Saga는 포함 관계인가, 사용 패턴 관계인가?
- batch framework가 workflow orchestration까지 지원하면 어느 지점부터 책임이 과해지는가?

## 다시 떠올리기

Q. Durable Workflow가 durable하게 만드는 것은 무엇인가?  
A. 단순 데이터가 아니라 "업무 실행의 진행 상태"다.

Q. 일반 DB transaction과 무엇이 다른가?  
A. 여러 시스템·긴 시간·대기·재시도를 하나의 ACID transaction으로 묶을 수 없는 경우를 다룬다.

Q. OxideBatch와 가장 큰 차이는?  
A. OxideBatch는 bounded dataset processing의 restartability가 중심이고, Temporal/DBOS는 business process execution의 지속성이 중심이다.

Q. Production durability와 local evaluation이 왜 충돌할 수 있는가?  
A. persistence·distribution·recovery machinery는 production 안정성에는 필요하지만, 반복 실행이 중요한 eval loop에는 실행 비용과 초기화 복잡성을 추가하기 때문이다.

Q. 이를 완화하는 설계 방향은?  
A. workflow business logic과 durable execution runtime을 분리해 같은 논리를 lightweight/durable runtime에서 각각 실행할 수 있게 하는 것이다.

## Related

- Saga
- Idempotency
- Batch Restartability
- State Machine
- DBOS
- Temporal

## Sources

- InfoQ, *Runtime-Agnostic AI Workflows: a Pattern for Production Durability and Fast Eval Iteration*  
  https://www.infoq.com/articles/ai-workflow-pattern/
- DBOS Architecture  
  https://docs.dbos.dev/architecture
- Temporal Documentation  
  https://docs.temporal.io/
