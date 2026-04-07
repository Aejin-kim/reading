"use server";

const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export async function saveReadingReport(data: any) {
  if (!SCRIPT_URL) return { success: false, error: "서버 설정 오류: GOOGLE_SCRIPT_URL이 설정되지 않았습니다." };
  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(data),
      redirect: "follow",
    });

    if (!response.ok) {
        console.error("Sheet Sync Failed:", await response.text());
        return { success: false, error: "구글 시트 저장에 실패했습니다." };
    }

    const text = await response.text();
    try {
        const result = JSON.parse(text);
        return { success: true, result };
    } catch {
        return { success: true, result: "Saved (Opaque Response)" };
    }
  } catch (error: any) {
    console.error("Server Action POST Error:", error);
    return { success: false, error: error.message };
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export async function generateBookAIStuff(title: string, author: string = "", description: string = "") {
  try {
    const prompt = `
      You are an expert reading coach for children. Based on the book "${title}" ${author ? `by ${author}` : ""} 
      ${description ? `(Summary: ${description})` : ""}, please generate:
      1. 5 multiple-choice comprehension questions to check if the child understood the book correctly.
         - Each question should have 4 options.
         - One of the options MUST be the correct answer.
         - Provide the correct answer index (0-3).
         - IMPORTANT: Be strictly faithful to the actual plot and characters of the book. DO NOT make up generic questions.
      2. 3 tailored open-ended questions to encourage deeper thinking, customized to this specific book's themes.

      The output MUST be in Korean and strictly follow this JSON format:
      {
        "quizzes": [
          {
            "question": "question text",
            "options": ["opt1", "opt2", "opt3", "opt4"],
            "answer": 0
          },
          ...
        ],
        "guides": [
          "guide question 1",
          "guide question 2",
          "guide question 3"
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Attempt to extract JSON if it's wrapped in triple backticks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not find JSON in AI response.");
    
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      success: true,
      quizzes: parsed.quizzes,
      guides: parsed.guides
    };
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchReadingReports() {
  if (!SCRIPT_URL) return { success: false, error: "서버 설정 오류: GOOGLE_SCRIPT_URL이 설정되지 않았습니다." };
  try {
    const response = await fetch(SCRIPT_URL, { 
        method: "GET", 
        cache: "no-store",
        headers: { "Accept": "application/json" }
    });
    
    if (!response.ok) throw new Error(`HTTP 오류! 상태코드: ${response.status}`);
    
    const textData = await response.text();
    try {
        const data = JSON.parse(textData);
        return { success: true, data };
    } catch (e) {
        console.error("JSON 파싱 오류. 수신된 데이터:", textData.substring(0, 500));
        throw new Error("데이터 형식이 올바르지 않습니다. (Apps Script 설정을 확인해주세요)");
    }
  } catch (error: any) {
    console.error("Fetch GET Error:", error);
    return { success: false, error: error.message };
  }
}

export async function searchAladinBooks(query: string) {
  try {
    const ttbKey = process.env.ALADIN_TTB_KEY;
    if (!ttbKey) throw new Error("서버 설정 오류: ALADIN_TTB_KEY가 설정되지 않았습니다.");
    const url = `https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${ttbKey}&Query=${encodeURIComponent(query)}&QueryType=Title&MaxResults=12&start=1&SearchTarget=Book&output=js&Version=20131101`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("알라딘 API 응답 오류");
    
    const text = await response.text();
    // Sometimes Aladin returns JS that needs JSON parsing of the data
    const data = JSON.parse(text);
    
    return { 
      success: true, 
      items: data.item?.map((item: any) => ({
        title: item.title,
        author: item.author,
        thumbnail: item.cover,
        publisher: item.publisher,
        description: item.description 
      })) || []
    };
  } catch (error: any) {
    console.error("Aladin Search Error:", error);
    return { success: false, error: error.message };
  }
}
export async function validatePassword(password: string) {
  const correct = process.env.APP_PASSWORD || "1234";
  return { success: password === correct };
}
