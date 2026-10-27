"use client";

import { useEffect, useState } from "react";

const TICK_MS = 30;

/**
 * Hiện dần `text` theo từng cụm 1–3 từ để mô phỏng LLM streaming (chỉ dùng cho bản demo).
 * `start = false` thì chờ; đổi `text` thì chạy lại từ đầu.
 */
export function useTypewriter(text: string, start = true): { output: string; done: boolean } {
  const [length, setLength] = useState(0);
  const [prevText, setPrevText] = useState(text);

  // Đổi văn bản → đặt lại tiến độ ngay trong lúc render (tránh setState trong effect).
  if (prevText !== text) {
    setPrevText(text);
    setLength(0);
  }

  useEffect(() => {
    if (!start || length >= text.length) return;
    const timer = setTimeout(() => {
      // Nhảy tới sau 1–3 khoảng trắng tiếp theo để chữ hiện theo cụm từ.
      let next = length;
      for (let words = 1 + Math.floor(Math.random() * 3); words > 0 && next < text.length; words--) {
        const space = text.indexOf(" ", next + 1);
        next = space === -1 ? text.length : space;
      }
      setLength(next);
    }, TICK_MS);
    return () => clearTimeout(timer);
  }, [start, length, text]);

  return { output: text.slice(0, length), done: length >= text.length };
}
