# Random Access Parquet

- Status: seed
- Added: 2026-11-17
- Source month: 2026-08

## 한 줄 요약

Parquet 자체를 OLTP DB처럼 바꾸지 않고 **외부 index를 추가해 필요한 file/row 위치를 바로 찾음으로써 data lake에서 point lookup을 가능하게 하는 접근**이다.

## 왜 중요한가

Parquet와 distributed query engine은 대량 scan과 analytics에는 강하지만 `user_id = 123` 같은 한 건 조회에는 불필요한 planning·metadata traversal·file scan 비용이 크다.

온라인 서비스나 AI agent가 data lake의 한두 record를 읽기 위해 같은 데이터를 별도 serving DB로 계속 복제하면 저장 비용과 동기화 복잡성이 생긴다.

Spotify의 Random Access Parquet(RAP)는 같은 Parquet data를 유지하면서 별도 index로 정확한 file/row 위치를 찾아 작은 ranged read만 수행하는 방향이다.

## 핵심 개념

- Parquet
- data lake
- analytical scan vs point lookup
- external index
- file/row location
- ranged read
- storage/serving duplication
- secondary index

## 내가 이해한 예

기존:

```text
Data Lake (Parquet)
      ↓ ETL / sync
Serving DB
      ↓
GET user 123
```

RAP 계열 접근:

```text
key = user:123
      ↓
external index
      ↓
file X / row range Y
      ↓
small ranged read from Parquet
```

핵심은 "Parquet을 랜덤 액세스에 최적화된 DB로 만든다"가 아니라 **랜덤 액세스용 access path를 따로 둔다**는 것이다.

## 헷갈리는 점

- index update와 Parquet/Iceberg snapshot consistency는 어떻게 맞추는가?
- lookup 빈도가 높아지면 결국 serving DB가 더 경제적인 지점은 어디인가?
- range query나 multi-key query까지 어느 수준으로 확장할 수 있는가?

## 다시 떠올리기

Q. Parquet point lookup이 느린 이유는 storage가 느려서인가?  
A. 꼭 그렇지 않다. query planning, metadata 탐색, file/row 위치 탐색 비용이 큰 부분을 차지할 수 있다.

Q. RAP의 핵심 아이디어는?  
A. key를 정확한 Parquet file/row 위치로 매핑하는 외부 index를 둔다.

Q. 무엇을 줄일 수 있는가?  
A. online serving을 위해 동일 dataset을 별도 operational DB에 복제하는 필요를 일부 줄일 수 있다.

## Related

- Parquet
- Apache Iceberg
- Secondary Index
- Data Lakehouse
- Serving Layer

## Sources

- Spotify Engineering, *Indexing the Data Lake for Online Point Queries*  
  https://engineering.atspotify.com/2026/7/indexing-the-data-lake-for-online-point-queries
- InfoQ, *Spotify Builds External Index to Enable Low Latency Point Queries on its Data Lake*  
  https://www.infoq.com/news/2026/08/spotify-data-lake-point-queries/
