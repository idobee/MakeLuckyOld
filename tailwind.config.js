/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}", // 컴포넌트 폴더 경로 추가
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}