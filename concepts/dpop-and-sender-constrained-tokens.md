# DPoP and Sender-Constrained Tokens

- Status: seed
- Added: 2026-11-18
- Source month: 2026-10

## 한 줄 요약

DPoP는 OAuth token을 client가 보유한 asymmetric key와 묶어, **token만 탈취한 공격자가 그대로 replay하지 못하게 하는 sender-constraining 방식**이다.

## 왜 중요한가

일반 Bearer token의 보안 모델은 단순하다.

~~~text
token을 가진 사람
= 사용할 수 있는 사람
~~~

따라서 access/refresh token이 탈취되면 만료 전까지 공격자가 replay할 수 있다.

DPoP는 token 사용 시 client가 private key로 서명한 proof JWT를 함께 요구한다.

~~~text
token
+
matching private key proof
→ 요청 허용
~~~

token만 훔쳐서는 충분하지 않다.

## 핵심 개념

- OAuth 2.0
- bearer token
- sender-constrained token
- asymmetric key pair
- DPoP proof JWT
- JWK thumbprint
- cnf.jkt
- htm / htu
- jti replay protection
- nonce
- token exchange

## 내가 이해한 예

Bearer token:

~~~text
client ── bearer token ──> API

attacker가 token 탈취
        ↓
같은 token replay 가능
~~~

DPoP:

~~~text
client
 ├─ token
 └─ private key

request
 ├─ token
 └─ signed DPoP proof
        ↓
API가 token과 proof key binding 확인
~~~

공격자가 token만 얻어도 matching private key가 없으면 정상 proof를 만들 수 없다.

## Proof가 request 자체에도 묶인다

DPoP proof에는 대표적으로 다음 정보가 들어간다.

- htm: HTTP method
- htu: target URI
- iat: issued-at
- jti: unique proof identifier

즉 proof 하나를 다른 endpoint나 다른 method로 그대로 재사용하기 어렵게 설계한다.

## Spring Security에서 주의할 점

Spring Security 7 계열에서는 DPoP와 RFC 8693 Token Exchange를 조합할 수 있다.

특히 service-to-service 호출에서는 사용자 token을 그대로 downstream에 넘기기보다:

~~~text
user subject token
+
service actor identity
        ↓ token exchange
narrowed downstream token
        ↓
DPoP-bound to caller key
~~~

처럼 audience/scope를 줄인 token으로 바꾸는 방식이 가능하다.

또 clustered deployment에서는 DPoP proof의 jti replay cache가 single-node memory에만 있으면 node 간 replay 방지가 깨질 수 있으므로 distributed replay state가 필요한지 검토해야 한다.

## 한계

DPoP가 모든 credential theft를 해결하지는 않는다.

- private key까지 탈취되면 보호가 약해진다.
- web session cookie 문제와는 별도다.
- nonce/jti/replay cache 운영이 필요하다.
- 매 요청 cryptographic verification 비용이 생긴다.

## 헷갈리는 점

- access token과 refresh token 중 어느 수준까지 DPoP를 적용할 것인가?
- multi-node resource server에서 replay cache를 어디에 둘 것인가?
- mTLS sender-constrained token과 DPoP의 선택 기준은?
- service-to-service delegation에서 token exchange policy를 어디까지 좁혀야 하는가?

## 다시 떠올리기

Q. Bearer token의 핵심 약점은?  
A. token 자체를 가진 주체가 곧 사용 권한을 가진다는 점이다.

Q. DPoP가 추가하는 것은?  
A. token 외에 matching private key로 만든 request-bound proof다.

Q. token만 탈취한 공격자가 왜 바로 못 쓰는가?  
A. API가 token과 proof의 key binding을 확인하기 때문이다.

## Related

- OAuth 2.0
- JWS / JWK
- Replay Protection
- Token Exchange
- mTLS
- Idempotency jti

## Sources

- InfoQ, *Google Adopts DPoP to Strengthen OAuth 2.0 against Token Theft and Replay Attacks*  
  https://www.infoq.com/news/2026/10/google-dpop-oauth2/
- InfoQ, *Server-Side DPoP and Token Exchange in Spring Security 7*  
  https://www.infoq.com/articles/spring-security-7-server-side-dpop-token-exchange/
