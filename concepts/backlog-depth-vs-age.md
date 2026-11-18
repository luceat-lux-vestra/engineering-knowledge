# Backlog Depth vs Age

- Status: learning
- Added: 2026-11-18
- Source month: 2026-09~11

## 한 줄 요약

Queue나 streaming pipeline의 backlog는 **몇 건 밀렸는가(depth)**와 **가장 오래된 미처리 데이터가 얼마나 오래됐는가(age)**를 따로 봐야 한다.

## 왜 중요한가

Kafka consumer lag처럼 "미처리 record 수"만 보면 실제 사용자가 느끼는 데이터 freshness를 오판할 수 있다.

같은 100,000건 backlog라도 producer rate가 초당 백만 건이면 매우 짧은 지연일 수 있고, 100건뿐이어도 분당 한 건 들어오는 시스템이면 수십 분 이상 오래된 데이터일 수 있다.

## 핵심 개념

- backlog depth
- queue age
- Kafka offset lag
- time in queue
- freshness SLA
- checkpoint
- oldest unprocessed message

## 내가 이해한 예

~~~text
Case A
lag = 100,000 records
producer = 1,000,000 msg/s

→ 약 0.1초 분량
~~~

~~~text
Case B
lag = 100 records
producer = 1 msg/min

→ 약 100분 분량
~~~

record count만 보면 A가 훨씬 심각해 보이지만 실제 freshness는 B가 더 나쁘다.

그래서 운영 관점에서는 다음 둘을 같이 본다.

~~~text
depth = 미처리 record 수
age   = 가장 오래된 미처리 record가 기다린 시간
~~~

## Hudi 사례

Hudi pipeline은 성공적으로 commit한 Kafka offset을 checkpoint로 저장한다.

이를 이용해:

~~~text
latest committed checkpoint
        ↓
Kafka partition의 next unread offset으로 seek
        ↓
record timestamp 조회
        ↓
now - timestamp
        ↓
time in queue
~~~

를 계산할 수 있다.

이 패턴은 Hudi에만 국한되지 않는다. 처리 시스템이 "마지막으로 확정된 위치"를 알 수 있다면 oldest pending data의 age를 별도 관측할 수 있다.

## Zero lag는 recovery verdict가 아니다

Backlog depth와 age가 0으로 돌아왔다는 것은 **position movement가 끝났다는 신호**이지, business state가 정상으로 수렴했다는 증거는 아니다.

예를 들어 Kafka recovery에서:

~~~text
consumer lag = 0
error rate = normal
~~~

이어도 다음은 남아 있을 수 있다.

- 중복 side effect
- 일부 record의 silent skip
- DLQ / quarantine
- projection drift
- source-of-truth와 downstream state 불일치

따라서 recovery run은 "몇 건 처리했는가"보다 terminal outcome을 account해야 한다.

~~~text
expected
=
APPLIED
+ UPDATED
+ SKIPPED
+ DUPLICATE_SUPPRESSED
+ FAILED_FINAL
+ QUARANTINED
~~~

retry 중인 record는 아직 terminal이 아니다.

마지막에는 source-of-truth와 reconciliation을 수행해 명시적인 recovery verdict를 내려야 한다.

~~~text
movement complete
        ↓
terminal outcomes close
        ↓
reconciliation
        ↓
CLEAR / FAILED
~~~

핵심은 **progress metric과 correctness verdict를 분리**하는 것이다.

## Queue age보다 더 상위에는 user-visible latency가 있다

Queue depth와 oldest-message age가 좋아도 사용자가 체감하는 전체 작업시간은 느릴 수 있다.

Async pipeline은 보통:

~~~text
request
  ↓
enqueue
  ↓
queue wait
  ↓
worker execution
  ↓
downstream call
  ↓
completion
~~~

처럼 여러 구간으로 구성된다.

따라서 관측 계층을 다음처럼 구분할 수 있다.

~~~text
depth
= 몇 건 밀렸는가

age
= 가장 오래된 미처리 작업이 얼마나 기다렸는가

end-to-end latency
= 사용자가 요청한 뒤 business completion까지 얼마나 걸렸는가

recovery verdict
= 최종 business state가 실제로 정상으로 수렴했는가
~~~

OpenTelemetry trace context를 queue message와 함께 전달하면 enqueue 이전부터 worker/downstream completion까지 하나의 trace로 연결할 수 있다.

이때 SLO는 queue size보다 실제 사용자 대기시간의 latency distribution을 기준으로 잡는 편이 더 직접적일 수 있다.

즉 이 문서의 계층은:

~~~text
depth
!= age
!= user-visible end-to-end latency
!= correctness / recovery verdict
~~~

다.

## 헷갈리는 점

- 여러 partition이 있을 때 max age만 볼지 percentile도 볼지?
- producer timestamp와 broker arrival timestamp 중 무엇을 SLA 기준으로 써야 하는가?
- backlog가 없을 때 freshness를 어떻게 정의하는가?

## 다시 떠올리기

Q. Kafka offset lag는 무엇을 말해주는가?  
A. consumer가 몇 record 뒤처졌는지를 보여준다.

Q. Offset lag만으로 freshness를 알 수 있는가?  
A. 아니다. producer rate와 message age를 모르면 데이터가 실제로 얼마나 오래됐는지 알 수 없다.

Q. 일반화하면 어떤 운영 원칙인가?  
A. queue depth와 oldest message age를 별도 지표로 보라는 것이다.

## Related

- Kafka
- Backpressure
- Freshness SLA
- Checkpoint
- Queue Monitoring

## Sources

- InfoQ, *Beyond Offset Lag: Computing Time in Queue for Apache Hudi Data Lake Pipelines at Petabyte Scale*  
  https://www.infoq.com/articles/beyond-offset-lag-kafka-apache-hudi/
- DZone, *Consumer Lag Is the Wrong Finish Line*  
  https://dzone.com/articles/consumer-lag-recovery
- InfoQ / QCon, *Uncorking Queueing Bottlenecks with OpenTelemetry*  
  https://www.infoq.com/presentations/opentelemetry-queue-observability/
