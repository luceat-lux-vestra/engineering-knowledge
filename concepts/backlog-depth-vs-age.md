# Backlog Depth vs Age

- Status: seed
- Added: 2026-11-18
- Source month: 2026-09

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
