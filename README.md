<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI 행운만들기 습관 앱

Google AI Studio에서 제작한 행운 만들기 습관 앱입니다.

View your app in AI Studio: https://ai.studio/apps/drive/1VmdDsZ50Vq6qN7ZqgPlbxfxSgPw9eaqM

## 로컬에서 실행하기

**필수 요구사항:** Node.js

1. 의존성 설치:
   ```bash
   npm install
   ```
2. `.env.local` 파일에 필요한 환경변수 설정:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   GOOGLE_SHEET_ID=your_google_sheet_id_here
   ```
3. 앱 실행:
   ```bash
   npm run dev
   ```

## GitHub Pages에 배포하기

### 1. GitHub 저장소 생성
- GitHub에서 새 저장소를 생성합니다
- 저장소 이름을 `BuildLucky`로 설정합니다

### 2. 코드 업로드
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/BuildLucky.git
git push -u origin main
```

### 3. GitHub Pages 설정
1. GitHub 저장소의 Settings 탭으로 이동
2. Pages 섹션에서 Source를 "GitHub Actions"로 설정
3. 저장소의 Settings > Secrets and variables > Actions에서 다음 환경변수 추가:
   - `GEMINI_API_KEY`: Gemini API 키
   - `GOOGLE_SHEET_ID`: Google Sheets ID

### 4. 자동 배포
- main 브랜치에 코드를 푸시하면 자동으로 GitHub Pages에 배포됩니다
- 배포된 사이트는 `https://yourusername.github.io/BuildLucky/`에서 확인할 수 있습니다
