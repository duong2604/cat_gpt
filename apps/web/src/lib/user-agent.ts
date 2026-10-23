export interface DeviceInfo {
  browser: string | null;
  os: string | null;
  isMobile: boolean;
}

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/CocCoc|coc_coc/, "Cốc Cốc"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
  [/PostmanRuntime/, "Postman"],
];

const SYSTEMS: [RegExp, string][] = [
  [/Windows/, "Windows"],
  [/iPhone|iPad|iPod/, "iOS"],
  [/Android/, "Android"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/Linux/, "Linux"],
];

/** Nhận diện đơn giản trình duyệt và hệ điều hành từ User-Agent để hiển thị danh sách phiên. */
export function parseUserAgent(ua: string | null): DeviceInfo {
  if (!ua) return { browser: null, os: null, isMobile: false };
  return {
    browser: BROWSERS.find(([re]) => re.test(ua))?.[1] ?? null,
    os: SYSTEMS.find(([re]) => re.test(ua))?.[1] ?? null,
    isMobile: /Mobi|Android|iPhone|iPad/.test(ua),
  };
}
