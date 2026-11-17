# Infrastructure State Boundaries

- Status: seed
- Added: 2026-11-18
- Source month: 2026-09

## 한 줄 요약

Terraform state는 resource 개수나 파일 크기보다 **ownership, lifecycle, change frequency, blast radius가 함께 움직이는 경계**를 따라 나누는 편이 낫다.

## 왜 중요한가

Terraform monolith의 문제를 흔히 "resource가 너무 많다"라고 설명하지만, 더 근본적인 문제는 서로 다른 lifecycle과 owner를 가진 인프라가 하나의 state에 묶여 있다는 것이다.

작은 application setting 하나를 바꾸는데 networking, DNS, Key Vault, storage, monitoring까지 모두 refresh하고 plan해야 한다면 state가 변경 경계를 과도하게 결합한 상태다.

## 핵심 개념

- Terraform state
- coupling
- ownership boundary
- lifecycle boundary
- change frequency
- blast radius
- dependency graph

## 내가 이해한 예

나쁜 분리 기준:

~~~text
resources > 500
→ 두 개로 나누자
~~~

더 나은 질문:

~~~text
이 resource들은 같은 팀이 소유하는가?
항상 같이 변경되는가?
배포 주기가 비슷한가?
한쪽 실패가 다른 쪽과 같은 blast radius를 가져야 하는가?
~~~

예를 들어:

~~~text
network / DNS
        ↓ stable foundation

application / app-specific secrets
        ↓ frequent change

monitoring configuration
        ↓ independent lifecycle
~~~

처럼 변경 특성이 다르면 각각 다른 state boundary가 더 자연스러울 수 있다.

## 왜 서비스 경계 문제와 비슷한가

State를 나눈다고 coupling 자체가 없어지는 것은 아니다.

잘못 나누면 remote state reference와 cross-state dependency가 늘어 다른 형태의 coupling이 생긴다.

따라서 목표는 "작은 state 여러 개"가 아니라 **독립적으로 변경하고 검증할 수 있는 ownership boundary**다.

## 헷갈리는 점

- cross-state dependency가 많아지는 임계점은 어디인가?
- shared networking 같은 진짜 공용 infrastructure의 owner는 어떻게 정하는가?
- state split 이후 transaction-like 변경이 필요한 경우 어떤 배포 전략을 써야 하는가?

## 다시 떠올리기

Q. Terraform monolith가 큰 것 자체가 문제인가?  
A. 아니다. 서로 다른 owner와 lifecycle이 하나의 state boundary에 묶이는 것이 더 큰 문제다.

Q. 어떤 기준으로 state를 나눌 수 있는가?  
A. ownership, change frequency, lifecycle, blast radius가 같이 움직이는지를 본다.

Q. 무조건 많이 나누면 좋은가?  
A. 아니다. cross-state dependency가 늘면 새로운 coupling이 생긴다.

## Related

- Coupling
- Ownership Boundary
- Blast Radius
- Infrastructure as Code
- Modular Architecture

## Sources

- DZone, *Your Terraform Monolith Isn't Too Big. It's Tightly Coupled.*  
  https://dzone.com/articles/terraform-state-coupling
