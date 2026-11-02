# Custody Security Watch

공개된 블록체인 사고에서 스테이블코인 수탁 보안을 배우는 개인의 공개 노트입니다. 특정 회사의 내부 시스템이나 취약점을 관리하는 저장소가 아닙니다.

**사이트:** https://eunsujeo.github.io/custody-security-watch/ (GitHub Pages 설정 후 게시)

처음 공개한 기록은 2026-10-28 KST에 출처를 검토한 선별 사례 10개입니다. 사건 9개와 취약점 공지 1개를 구분하며, 순위는 피해액이 아니라 스테이블코인 수탁 학습 관련성입니다. 전체 사고를 전수 조사했다는 뜻은 아닙니다.

## 읽을 수 있는 내용

- 중요도 TOP 10과 사건별 상세 페이지
- 모든 체인을 고려한 체인·자산·공격 유형·기록 종류 필터와 검색
- 발생일과 공개일, 회사 주장과 보안 분석, 미확인 사항
- 실제 유출·추정치·동결·반환·환급 약속의 구분
- 수탁 지갑 운영에 적용할 교훈과 원문 출처·수정 이력
- 기간별 주간보고 보관함과 최신 보고서 (첫 노트 2026-10-19–25 보존)
- Issue를 통한 정정·사건 제안, Pull Request 기여

**출처를 검토한 정적 사이트**입니다. 기존 ChatGPT 주간 자동화가 보고서를 게시하고, 사건 알림 자동화는 이미 게시된 사건의 중요한 후속을 출처와 대조해 반영합니다. main 변경 시 GitHub Actions가 검사·빌드·배포합니다. 사이트나 GitHub Actions 자체가 뉴스를 검색하는 구조는 아닙니다. 자동화의 GitHub 연결 실패나 배포 실패는 성공으로 처리하지 않고 대화에 보고합니다. API 키나 서버 없이 읽을 수 있으며, 외부 폰트·분석 스크립트를 사용하지 않습니다.

## 로컬 실행

Node.js 22 이상과 미리보기용 Python 3이 필요합니다. npm 외부 의존성은 없습니다.

```bash
npm test
npm run build
npm run preview
```

http://localhost:4173 에서 확인합니다. 상세 페이지는 빌드 시 HTML로 생성되어 JavaScript 없이도 읽을 수 있습니다. 검색·필터는 브라우저 JavaScript가 필요합니다. `file://`로 열면 검색 데이터 fetch가 실패할 수 있으니 HTTP 서버를 사용하세요.

## GitHub Pages 첫 게시

1. [Settings → Pages](https://github.com/eunsujeo/custody-security-watch/settings/pages)에서 **Build and deployment → Source → GitHub Actions**를 선택합니다.
2. [Actions](https://github.com/eunsujeo/custody-security-watch/actions)에서 `Check and publish Pages`를 열고 `Run workflow`를 실행합니다. 이후 `main` 변경은 자동 검사·빌드·배포됩니다.
3. 배포가 성공하면 위 사이트 주소에서 확인합니다. 최초 반영에는 시간이 걸릴 수 있습니다.

Pages 활성화는 저장소 설정 단계입니다. 워크플로 파일 자체가 Pages를 활성화하지 않습니다. PR은 검사만 하고, 배포 권한은 `main` 푸시·수동 실행의 deploy job에만 부여합니다.

### 파일 묶음에서 직접 업로드할 경우

압축을 풀면 소스와 미리 생성한 `dist/`가 함께 있습니다. 압축 파일 자체가 아니라 **안쪽 프로젝트 폴더의 파일들**을 사용하세요. `.github/` 폴더도 포함해야 배포 설정이 전달됩니다.

빈 저장소를 클론한 폴더에 내용을 복사한 뒤 다음을 실행할 수 있습니다. GitHub 인증이 된 본인 컴퓨터에서 진행하세요.

```bash
git add .
git commit -m "Build custody security learning notebook"
git push origin main
```

`dist/`는 `.gitignore`로 제외됩니다. GitHub Actions가 소스에서 다시 생성합니다. 첫 배포 전 위 Pages 설정은 별도로 필요합니다.

## 파일 구성

```text
data/incidents.json       선별 사건 카드와 출처·수정 이력
data/reports/YYYY-MM-DD.json  집계 기간·검토일·출처 링크를 담은 주간보고
src/reports.mjs           주간보고 검증과 안전한 Markdown 렌더링
src/model.mjs            데이터 검증·기간 선택·검색 규칙
src/style.css            공통 스타일
src/app.mjs              검색·필터와 공유 가능한 URL
scripts/build.mjs        HTML 생성과 주간 노트
test/site.test.mjs       데이터·검색·기간 경계·로컬 링크 검사
.github/workflows/       검사와 Pages 배포
.github/ISSUE_TEMPLATE/   정정·사건 제안 양식
dist/                    생성 결과 (git 제외)
```

## 기록을 추가·수정하는 방법

1. 공식 공지·보안 분석의 원문과 관측 시점을 확인합니다. 공지만 직접 확보하지 못하고 보도에서 인용했다면 이를 표시합니다.
2. `data/incidents.json`의 같은 사건 ID를 갱신합니다. 서로 다른 사고는 별도 ID를 씁니다. 출처 ID와 각 사실의 `sources` 연결을 유지합니다.
3. `history`에 수정 날짜·이유를 추가하고 `asOf`를 실제 검토일로 바꿉니다. 이 날짜는 자동으로 현재 날짜가 되지 않습니다.
4. 순위를 바꾸면 중복 없는 양의 정수로 조정하고 이유(`why`)도 갱신합니다. 피해액 순위와 혼동하지 않도록 설명합니다.
5. `npm test`와 `npm run build` 후 미리보기에서 확인하고 커밋 또는 PR을 만듭니다.

주간보고는 `data/reports/YYYY-MM-DD.json`에 월요일 시작일을 파일명으로 저장합니다. 필수 필드는 `start`, `end`, `asOf`, `title`, `markdown`입니다. 월요일~일요일 KST의 7일 기간을 명시하고, `asOf`는 실제 검토일을 적습니다. 출처는 대화 전용 인용 ID가 아닌 HTTPS 원문 링크를 사용합니다. 임의 HTML은 실행하지 않습니다.

새 보고서를 추가하면 빌드가 가장 최근 집계 기간을 `weekly.html`에 표시하고, 기간별 `weekly-YYYY-MM-DD.html`을 함께 생성합니다. 첫 주 노트와 이전 보고서는 보존합니다. 같은 기간의 검증된 정정은 같은 파일에서 처리합니다. 미래 주를 미리 만들거나 달력 날짜만 바꿔 과거 보고서를 최신처럼 보이게 하지 마세요.

사건 카드의 `asOf`와 보고서의 `asOf`는 별개입니다. 주간보고 게시만으로 모든 기존 사건 카드를 재검토한 것으로 표시하지 않습니다. 카드 갱신 시에는 같은 사건 ID와 출처·수정 이력을 유지합니다.

기존 사건에 중요한 후속이 나오면 같은 기록을 갱신하고 공개 시각·출처·수정 이유를 남깁니다. 주간 집계 기간 이후 진전은 별도로 표시하며, 대화 알림과 사이트 반영 여부를 각각 확인합니다. 중복 보도만 있으면 갱신하지 않습니다.

자동 게시 절차는 [UPDATE.md](UPDATE.md)를 따릅니다. 발생일이 불명확한 장기 노출은 최초 공개일 기준임을 표시하고, 시간대 경계가 불명확하면 단정하지 않습니다.

## 편집 기준과 기여

- 공식 공지도 운영자의 주장으로 분류할 수 있습니다. 서비스 내부 장부나 기술 원인까지 독립 검증됐다고 확대하지 않습니다.
- 유효한 서명은 정상 사용자 요청의 증명이 아닙니다. 유효한 서명만으로 키 파일 반출을 단정하지도 않습니다.
- 동결은 반환이 아니며, 환급 약속은 지급 완료가 아닙니다. 무담보 발행 액면가와 실제 외부 유출액을 합산하지 않습니다.
- 출처별 관측 시각과 총피해·추가피해를 구분합니다. 원문의 오래된 잔액을 현재 잔액으로 쓰지 않습니다.
- 개인키·시드·API 키·미공개 취약점·고객 정보는 공개 Issue나 PR에 올리지 마세요.

[정정·제안하기](https://github.com/eunsujeo/custody-security-watch/issues/new/choose) · [변경 이력](https://github.com/eunsujeo/custody-security-watch/commits/main)

사건 설명은 출처를 근거로 새로 요약한 내용입니다. 외부 원문·상표의 권리는 해당 권리자에게 있으며 이 저장소가 그 이용 권리를 부여하지 않습니다. 코드와 자체 작성 문서의 별도 배포 라이선스는 아직 지정하지 않았습니다.

## 홈 순위와 상세 경과

주간보고에는 `rankedIncidentIds` 배열로 최대 10개의 사건 ID를 순서대로 저장한다. 주간 게시 시 해당 사건 카드를 `data/incidents.json`에 함께 추가·갱신한다. 홈 TOP 10과 첫 추천 사례는 최신 보고서의 이 배열에서 생성된다. 연결이 누락되거나 ID가 중복·미등록이면 빌드를 실패시켜 과거 순위가 그대로 게시되는 일을 막는다. 이전 사건의 ID·상세 URL·출처·수정 이력은 보존한다.

카드의 `reviewedAt`은 해당 본문의 실제 검토일이다. `timeline`은 `{at, label, text, sources}` 배열이며, `at`에는 확인된 KST ISO 시각(`+09:00`) 또는 날짜만 넣는다. 발생, 공개, 중단, 복구, 동결, 반환, 보상을 구분하고 같은 날짜 안에서 시각이 없으면 순서를 확정하지 않는다. 시간 미확인·실제 발생 시각 미공개는 본문에도 명시한다. 날짜가 전혀 확인되지 않은 사건은 날짜를 만들어 넣지 말고 본문에 미확인으로 기록한다. 후속 갱신 시 현재 요약·대응 상태와 시간순 경과·수정 이력을 함께 유지한다.

## 용어 설명 툴팁

본문의 점선 밑줄 용어는 마우스오버, 키보드 초점 또는 클릭·탭으로 설명을 볼 수 있습니다. Esc 또는 바깥 클릭으로 닫습니다. 홈·주간보고·과거 보관함·상세 페이지에 같은 용어집을 적용합니다. 출처 링크와 버튼·제목·코드 블록은 바꾸지 않습니다. JavaScript가 실행되지 않으면 기본 브라우저 툴팁을 사용합니다.

용어와 쉬운 설명은 `src/glossary.mjs`에서 관리합니다. 새 용어는 짧은 뜻과 이 사건에서의 역할을 적고 문서마다 의미가 다른 표현은 문맥을 명시합니다. 긴 영어 단어 안의 일부만 잘못 매칭하지 않도록 검사합니다. PoR 설명은 [Binance](https://www.binance.com/en/proof-of-reserves), Binance 14는 [Blockaid](https://blockaid.io/blog/binance-55b-hack-using-advanced-ai-models-blockaid-detects-the-biggest-theft-in-crypto-history), Security Council은 [Arbitrum 공식 문서](https://docs.arbitrum.foundation/concepts/security-council), ZachXBT의 이 사건 역할은 [본인 발표](https://x.com/zachxbt/status/2115960582230913357)를 대조했습니다.
