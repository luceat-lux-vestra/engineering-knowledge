# Reproducible Builds

- Status: seed
- Added: 2026-11-18
- Source month: 2026-10

## 한 줄 요약

"Works on my machine"은 단순 환경 문제가 아니라 **빌드·실행 결과에 영향을 주는 입력 일부가 versioned/declarative system 밖에 숨어 있다는 신호**다.

## 왜 중요한가

source code가 같아도 다음이 다르면 결과가 달라질 수 있다.

- runtime / compiler version
- CPU architecture
- native library
- filesystem semantics
- locale / timezone
- certificate store
- environment variable
- dependency resolution
- build tool version

이 값들이 workstation에 암묵적으로 존재하면 workstation 자체가 숨은 dependency가 된다.

## 핵심 개념

- reproducible build
- hermetic build
- pinned toolchain
- lockfile
- immutable image
- devcontainer
- build sandbox
- environment drift

## 내가 이해한 예

겉으로는:

~~~text
git checkout same SHA
./gradlew build
~~~

인데 developer A에서는 성공하고 CI에서 실패한다.

실제로는 입력이:

~~~text
source SHA
+ JDK 27.0.x
+ locale ko_KR
+ native lib v1
+ ~/.gradle cache state
+ OS filesystem behavior
~~~

처럼 더 많았던 것이다.

따라서 재현 가능한 시스템은 실제 입력을 최대한 선언한다.

~~~text
source
+ pinned runtime
+ pinned dependencies
+ explicit build image
+ controlled environment
→ same build behavior
~~~

## Hermetic과 Reproducible은 완전히 같은 말은 아니다

- reproducible: 같은 입력에서 같은 결과를 다시 만들 수 있는가?
- hermetic: build가 선언되지 않은 외부 상태에 의존하지 않는가?

Hermeticity가 높아질수록 reproducibility를 확보하기 쉬워진다.

## 실전 수단

- exact JDK/toolchain pinning
- dependency lock
- digest-pinned container image
- build cache key에 실제 입력 포함
- devcontainer / Nix / Bazel-style sandbox
- timezone/locale 명시
- network access 제한

## 헷갈리는 점

- 완전한 hermetic build가 비용 대비 필요한 프로젝트는 어디까지인가?
- architecture-specific native dependency는 어떤 방식으로 재현성 계약에 포함할 것인가?
- build cache와 reproducibility 검증을 어떻게 동시에 유지하는가?

## 다시 떠올리기

Q. "Works on my machine"의 구조적 원인은?  
A. 실행 결과를 결정하는 숨은 환경 입력이 존재하기 때문이다.

Q. source code만 version control에 있으면 충분한가?  
A. 아니다. toolchain, dependency, runtime environment도 결과에 영향을 준다.

Q. Hermetic build의 목표는?  
A. 선언되지 않은 외부 상태가 build 결과에 영향을 주지 못하게 하는 것이다.

## Related

- CI/CD
- Build Cache
- Supply Chain
- Dev Container
- Toolchain Pinning

## Sources

- DZone, *"Works on My Machine" Is an Architecture Problem*  
  https://dzone.com/articles/works-on-my-machine-architecture
