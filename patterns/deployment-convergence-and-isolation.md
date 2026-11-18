# Deployment Convergence and Isolation

- Status: seed
- Added: 2026-11-18
- Source month: 2026-11

## 한 줄 요약

대규모 deployment system에서는 "resource가 현재 healthy하다"보다 **내가 의도한 특정 deployment generation이 실제로 convergence했는지**를 추적하고, deployment 간 shared controller state가 만드는 failure coupling을 줄이는 것이 중요하다.

## 왜 중요한가

GitOps controller가 많은 application과 cluster 상태를 한 process/cache/watch graph에서 공유하면 한 deployment의 규모나 이상 동작이 다른 deployment의 reconciliation에도 영향을 줄 수 있다.

또 단순히 현재 Kubernetes object가 Healthy/Synced라고 해서 방금 요청한 revision이 실제로 반영된 것인지 항상 명확한 것은 아니다.

따라서 deployment identity와 convergence proof를 명시적으로 다루는 것이 중요하다.

## 핵심 개념

- GitOps
- desired state
- live state
- deployment generation
- convergence
- three-way diff
- controller isolation
- failure coupling
- ephemeral worker
- rollout identity

## 내가 이해한 예

공유 controller:

~~~text
deployment A ─┐
deployment B ─┼─> shared watch/cache/controller
deployment C ─┘
~~~

A가 매우 크거나 비정상 상태가 되면 shared resource pressure가 B/C에도 영향을 줄 수 있다.

격리된 방식:

~~~text
deployment A -> worker A
deployment B -> worker B
deployment C -> worker C
~~~

각 deployment worker가 짧은 lifecycle을 가지고 자신의 rollout만 처리하면 failure coupling을 줄일 수 있다.

## Convergence identity가 필요하다

단순 질문:

~~~text
현재 resource가 Healthy인가?
~~~

보다 더 강한 질문:

~~~text
deployment generation G가 의도한 desired state가
현재 live state에 정확히 convergence했는가?
~~~

가 필요하다.

이를 위해:

~~~text
previous desired state
current live state
new desired state
        ↓
three-way diff
        ↓
apply
        ↓
generation G convergence 확인
~~~

처럼 rollout identity를 유지할 수 있다.

## 일반화

이 개념은 Kubernetes에만 한정되지 않는다.

- schema migration
- infrastructure rollout
- config deployment
- feature flag propagation
- distributed cache/config convergence

에서도 "현재 상태가 괜찮다"와 "내가 방금 요청한 변경이 정확히 반영됐다"는 다른 질문이다.

## 헷갈리는 점

- per-deployment isolation의 overhead가 shared controller 이점보다 커지는 지점은 어디인가?
- convergence를 선언하려면 어떤 resource가 authoritative해야 하는가?
- partial rollout이나 intentionally skipped target은 generation verdict에 어떻게 포함하는가?

## 다시 떠올리기

Q. Healthy/Synced와 deployment convergence는 같은가?  
A. 아니다. 특정 rollout generation의 의도가 실제 live state에 반영됐는지를 별도로 증명해야 할 수 있다.

Q. Shared controller의 위험은?  
A. cache/watch/resource pressure와 failure가 여러 deployment 사이에 coupling될 수 있다.

Q. Isolation의 목표는?  
A. 한 deployment의 failure나 scale 특성이 다른 deployment의 reconciliation을 덜 방해하게 만드는 것이다.

## Related

- Progressive Delivery
- GitOps
- Blast Radius
- Desired State
- Reconciliation Loop

## Sources

- InfoQ, *LinkedIn Replaces Argo CD with a Custom GitOps Engine for Kubernetes Deployments*  
  https://www.infoq.com/news/2026/11/kubernetes-argocd-linkedin/
