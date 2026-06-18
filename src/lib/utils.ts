export function parseUserAgent(uaString: string | null): { device: string; browser: string } {
  if (!uaString) {
    return { device: "desktop", browser: "unknown" };
  }

  const ua = uaString.toLowerCase();
  let device = "desktop";
  let browser = "Other";

  // Device classification
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = "tablet";
  } else if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) {
    device = "mobile";
  }

  // Browser classification
  if (ua.includes("edg/")) {
    browser = "Edge";
  } else if (ua.includes("chrome") || ua.includes("chromium")) {
    browser = "Chrome";
  } else if (ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")) {
    browser = "Safari";
  } else if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("opr/") || ua.includes("opera")) {
    browser = "Opera";
  }

  return { device, browser };
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}
