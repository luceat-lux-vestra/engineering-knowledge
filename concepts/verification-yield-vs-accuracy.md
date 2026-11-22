# Verification Yield vs Accuracy

- Status: seed
- Added: 2026-11-18
- Source month: 2026-11

## 한 줄 요약

LLM reliability layer는 답을 실제로 더 많이 맞히게 만드는 것과 **틀릴 가능성이 높은 답을 걸러내는 것**을 구분해서 평가해야 하며, accuracy만 보면 과도한 abstention을 좋은 시스템으로 오해할 수 있다.

## 왜 중요한가

검증 단계를 추가하면 흔히 최종 출력의 accuracy가 올라간다.

하지만 검증기가 답을 고치는 대신 많은 요청을 거절하거나 보류해서 accuracy가 올라간 것이라면, 실제 사용자가 얻은 정답 수는 오히려 적을 수 있다.

따라서 reliability system에서는 accuracy뿐 아니라 **yield**를 같이 봐야 한다.

## 핵심 개념

- accuracy
- yield
- abstention
- deterministic validation
- self-correction
- voting
- LLM judge
- human escalation
- correlated failure
- independent evidence

## 내가 이해한 예

검증 전:

~~~text
100개 입력
30 correct
70 incorrect

accuracy = 30%
yield    = 30%
~~~

검증 후 10개만 답하도록 만들었다고 하자.

~~~text
10개 출력
8 correct
2 incorrect
90개 abstain
~~~

출력 accuracy는:

~~~text
8 / 10 = 80%
~~~

로 크게 좋아졌다.

하지만 전체 입력 기준 실제 정답 산출량은:

~~~text
8 / 100 = 8%
~~~

뿐이다.

즉 reliability layer가 더 좋은 답을 **생성**한 것인지, 위험한 답을 **거부**한 것인지 분리해서 봐야 한다.

## Verification layer의 역할을 구분한다

대표적인 층은 서로 다른 역할을 한다.

- deterministic check: 명백한 contract violation을 강하게 reject
- self-correction: 같은 모델이 자신의 답을 다시 검토
- voting: 여러 sample의 agreement 이용
- second-model judge: 별도 model의 평가
- human review: 비용이 높지만 다른 evidence channel 제공 가능

중요한 점은 reviewer 수와 independent evidence 수가 같지 않다는 것이다.

같은 model family, prompt, context, training lineage를 공유하면 여러 reviewer가 같은 오류를 반복할 수 있다.

## 좋은 평가 질문

- output accuracy는 얼마인가?
- 전체 입력 중 correct answer를 실제로 몇 개 제공했는가?
- abstention rate는 얼마인가?
- false acceptance와 false rejection은 각각 얼마인가?
- 검증 단계가 실제 오류를 고쳤는가, 단지 output을 줄였는가?
- reviewer들이 서로 독립적인 evidence를 사용했는가?

## 헷갈리는 점

- production task에서 yield를 어떤 business KPI와 연결할 것인가?
- abstention 비용과 wrong-answer 비용이 매우 다른 경우 threshold를 어떻게 정할 것인가?
- human escalation을 포함하면 end-to-end yield를 어떻게 계산하는가?

## 다시 떠올리기

Q. Accuracy가 높아지면 reliability가 반드시 좋아진 것인가?  
A. 아니다. 많은 입력을 거부해도 출력된 답의 accuracy는 높아질 수 있다.

Q. Yield는 무엇을 보는가?  
A. 전체 입력 중 실제로 correct result를 제공한 비율을 본다.

Q. 여러 LLM reviewer가 동의하면 독립적인 검증인가?  
A. 아니다. model/context/failure mode가 correlated할 수 있으므로 독립성을 별도로 검증해야 한다.

## Related

- [Agent Context Engineering](./agent-context-engineering.md)
- Evaluation
- LLM-as-a-Judge
- Independent Evidence
- Abstention

## Sources

- InfoQ, *LLM Reliability Layers Under Test: Accuracy, Yield, and the Limits of Verification*  
  https://www.infoq.com/articles/llm-reliability-layers-limits-accuracy/
