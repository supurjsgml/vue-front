// import express from "express";
// import puppeteer from "puppeteer";
// import cron from "node-cron";

// const app = express();

// // 잡코리아 이력서 갱신 함수
// const refreshJobKoreaResume = async (): Promise<void> => {
//   try {
//     const browser = await puppeteer.launch({
//       // executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",  //로컬용 (없어도 실행됨)
//       headless: true,  // 최신 headless 모드 사용
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage", // 메모리 공유 문제 해결
//         "--disable-gpu",           // GPU 비활성화 (윈도우 환경에서 유용)
//       ],
//     });

//     const page = await browser.newPage();

//     // User-Agent 설정 (Cloudflare 우회 가능성 높임)
//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
//     );

//     console.log("브라우저 실행 성공");

//     await page.goto("https://www.jobkorea.co.kr/Login/Login_Tot.asp");

//     // 로그인 (아이디/비밀번호 입력 및 로그인 버튼 클릭)
//     await page.type("#M_ID", "test");
//     await page.type("#M_PWD", "test");
//     await page.click(".login-button");
//     await page.waitForNavigation();
  
//     // 이력서 갱신 버튼 클릭
//     await page.goto("https://www.jobkorea.co.kr/User/Resume/View?rNo=19402578");
//     await page.click(".button-update"); // 실제 버튼의 클래스명을 확인 필요
  
//     console.log("이력서 갱신 완료!");
//     await browser.close();

//   } catch (error) {
//     console.error("Puppeteer 실행 중 오류 발생:", error);
//   }
// };


// // 30분마다 자동 실행
// cron.schedule("*/1 * * * *", () => {
//   console.log("이력서 갱신 작업 실행 중...");
//   refreshJobKoreaResume();
// });

// // 기본 서버 실행
// app.get("/", (_req, res) => {
//   res.send("JobKorea Auto Resume Updater Running!");
// });

// // const PORT = process.env.PORT || 3000;
// // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// 패키지 제이슨
// "local": "concurrently --kill-others \"nuxt dev --dotenv .env.local\" \"node --loader ts-node/esm server.ts\"",