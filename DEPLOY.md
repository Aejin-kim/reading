# 배포 가이드 (Vercel을 통해 전 세계 어디서나 접속하기)

아이들에게 이 링크 하나만 보내주면, 집 밖에서도 태블릿이나 폰으로 독서 기록을 남길 수 있습니다!

## 1. Vercel 계정 만들기
[Vercel](https://vercel.com/)에 접속하여 가입하세요. (GitHub 계정이 있다면 'Sign in with GitHub'이 가장 편합니다.)

## 2. GitHub에 프로젝트 올리기 (필수)
이 코드를 GitHub 저장소(Repository)에 먼저 올려야 합니다.

## 3. Vercel에서 프로젝트 연결
1. Vercel 대시보드에서 **[Add New] -> [Project]** 클릭
2. GitHub 저장소 중 `reading` 프로젝트를 선택하고 **[Import]** 클릭

## 4. 환경 변수(Environment Variables) 설정 (중요! ⭐)
배포 설정 화면 중간에 `Environment Variables` 섹션이 있습니다. 아래 3개를 반드시 입력해야 AI와 검색이 작동합니다.

| Key | Value (현재 설정값) |
| --- | --- |
| `GEMINI_API_KEY` | `AIzaSyADsn71tnPXEL9PB9UuK4UqamQ9SKQG9Xs` |
| `ALADIN_TTB_KEY` | `ttblongneck811117001` |
| `GOOGLE_SCRIPT_URL` | `https://script.google.com/macros/s/AKfycbz2H1gQhRv7UtfSRNa9MEy5MtXbP8qeQHUhFqFVHv4ixOUx227nBZlBzwivQvcxhLxN3Q/exec` |

## 5. 배포 완료
위 설정을 넣고 **[Deploy]** 버튼을 누르면 1~2분 뒤에 `https://reading-xxx.vercel.app` 같은 멋진 주소가 생성됩니다. 이 주소를 복사해서 아이들에게 카톡이나 문자로 보내주시면 끝!

---
> [!TIP]
> **로그인 기능이 필요하다면?** 현재는 누구나 접속 가능합니다. 만약 가족만 쓰게 하고 싶다면 나중에 간단한 비밀번호 기능을 추가해 드릴 수 있습니다.
