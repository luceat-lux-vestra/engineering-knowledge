# State-Space Remediation

- Status: seed
- Added: 2026-11-17
- Source month: 2026-08

## 한 줄 요약

복구 로직을 장애별 `if/else`와 runbook의 집합으로 쌓는 대신, **현재 상태·허용 가능한 상태·전이 비용을 그래프로 모델링하고 안전한 복구 경로를 탐색**할 수 있다.

## 왜 중요한가

인프라 topology가 복잡해질수록 장애마다 hard-coded remediation sequence를 추가하는 방식은 중간 상태와 복합 장애를 다루기 어려워진다.

Stripe는 MongoDB shard remediation에서 infrastructure state를 graph/state machine으로 모델링하고 search algorithm으로 복구 계획을 계산하는 접근을 공개했다.

## 핵심 개념

- state machine
- state graph
- valid / invalid state
- transition
- transition cost
- BFS / Dijkstra
- partial remediation
- planner + executor separation

## 내가 이해한 예

기존 방식:

```text
if primary_down:
    promote_replica()

if replica_lagging:
    rebuild_replica()

if primary_down && replica_lagging:
    ... 또 예외 추가
```

상태가 늘어날수록 조합이 폭발한다.

state-space 방식:

```text
현재 상태 S0
   ↓ 가능한 전이
S1 ──cost 1──> S2
 │             │
 cost 5        cost 1
 │             │
 ↓             ↓
S3 ──────────> VALID
```

복구 시스템은 "이 장애 이름에 해당하는 runbook"을 고르는 것이 아니라 현재 state에서 valid state까지의 안전하고 비용이 낮은 path를 계산한다.

완전 정상 상태까지 갈 수 없더라도 더 나은 intermediate state를 선택하는 partial remediation도 모델링할 수 있다.

## 헷갈리는 점

- state explosion을 실제 운영에서 어떻게 제한하는가?
- transition cost를 시간/위험도/데이터 손실 가능성 중 무엇으로 정의하는가?
- planner가 잘못된 topology/state를 입력받았을 때의 안전장치는?
- human approval을 어느 transition 앞에 두는가?

## 다시 떠올리기

Q. runbook 방식의 근본적 약점은?  
A. 장애 조합과 intermediate state가 늘수록 hard-coded sequence가 폭발한다.

Q. graph search가 해결하려는 것은?  
A. 현재 state에서 허용 가능한 state까지의 복구 경로를 동적으로 계산하는 것.

Q. 왜 Dijkstra가 등장할 수 있는가?  
A. 모든 remediation step의 위험/비용이 같지 않기 때문에 최소 step 수보다 최소 비용 경로가 필요할 수 있다.

## Related

- State Machine
- Automated Remediation
- Control Plane
- Progressive Collapse

## Sources

- InfoQ, *Stripe Uses Graph Search and State Machines to Automate Database Remediation*  
  https://www.infoq.com/news/2026/08/database-remediation-graph/
