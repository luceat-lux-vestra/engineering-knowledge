# Telemetry Signal vs Volume

- Status: seed
- Added: 2026-11-18
- Source month: 2026-09

## 한 줄 요약

Telemetry 비용을 줄이기 위해 **byte 수를 줄이는 것**과, 장애 분석에 쓸모없는 **noise를 줄이는 것**은 같은 문제가 아니다.

## 왜 중요한가

관측 비용이 커지면 흔히 INFO 로그 제거, sampling 비율 축소, retention 단축처럼 "쉽게 잘라낼 수 있는 category"부터 줄인다.

하지만 telemetry의 정보 가치는 용량과 비례하지 않는다.

- tenant_id, trace_id, deployment metadata처럼 작은 필드가 incident scope와 correlation에 결정적일 수 있다.
- 반복되는 동일 stack trace처럼 큰 데이터가 추가 정보는 거의 주지 않을 수 있다.

따라서 "30% 줄이기" 같은 volume 목표만으로는 미래의 디버깅 질문에 답할 능력까지 같이 잘라낼 수 있다.

## 핵심 개념

- telemetry volume
- signal / noise
- observability budget
- sampling
- cardinality
- correlation metadata
- investigation query
- observability pipeline testing

## 내가 이해한 예

다음 둘을 비교한다.

~~~text
trace_id = 32 chars
tenant_id = small string
deployment_id = small string
~~~

용량은 작지만 다음 질문에 답하게 해준다.

~~~text
이 장애는 특정 고객만 영향받았나?
이 alert의 trace는 어디인가?
어느 배포 이후 시작됐나?
~~~

반대로:

~~~text
동일한 4KB stack trace × 10,000
~~~

는 용량은 크지만 정보 증가는 제한적일 수 있다.

따라서 telemetry 최적화는 "몇 GB 줄였는가?"보다 "우리의 핵심 incident question에 여전히 답할 수 있는가?"를 같이 검증해야 한다.

## Observability pipeline도 테스트 대상이다

Telemetry pipeline 변경 전후에 실제 운영 질문을 test case처럼 남길 수 있다.

예:

- 특정 tenant의 오류율을 분리할 수 있는가?
- alert에서 관련 trace까지 연결할 수 있는가?
- regression이 시작된 deployment를 찾을 수 있는가?
- sampling 이후에도 rare failure를 분석할 수 있는가?

비용 절감이 성공했더라도 이 질문에 답하지 못하면 signal을 잃은 것이다.

## 헷갈리는 점

- trace/log/metric 각각의 sampling policy를 어떤 기준으로 분리해야 하는가?
- "나중에 필요할지도 모르는 signal"의 가치를 어떻게 사전에 평가하는가?
- high-cardinality metadata와 비용 사이의 경계를 어떻게 정하는가?

## 다시 떠올리기

Q. Telemetry volume이 줄면 noise도 자동으로 줄어드는가?  
A. 아니다. volume은 byte 수이고 signal은 그 데이터로 답할 수 있는 질문의 가치다.

Q. 작은 metadata가 왜 중요할 수 있는가?  
A. tenant, trace, deployment 같은 작은 필드가 장애 범위와 인과관계를 연결하는 핵심 key가 될 수 있다.

Q. 좋은 최적화 검증 방법은?  
A. 용량뿐 아니라 실제 incident query에 계속 답할 수 있는지 테스트하는 것이다.

## Related

- Observability
- Sampling
- Cardinality
- Distributed Tracing
- Incident Response

## Sources

- DZone, *Cutting Telemetry Volume Is Not the Same as Cutting Noise*  
  https://dzone.com/articles/telemetry-volume-noise
