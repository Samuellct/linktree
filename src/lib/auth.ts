// Native Web Crypto helpers for PBKDF2 password hashing and HMAC-SHA256 session tokens

const PBKDF2_ITERATIONS = 50000;
const KEY_LEN = 32; // 256 bits

// Convert buffer to hex string
function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Convert hex string to buffer
function hexToBuf(hex: string): Uint8Array {
  const view = new Uint8Array(hex.length / 2);
  for (let i = 0; i < view.length; i++) {
    view[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return view;
}

// Hash password using PBKDF2
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = bufToHex(salt);

  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const derivedKeyBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    passwordKey,
    KEY_LEN * 8
  );

  const hashHex = bufToHex(derivedKeyBits);
  return `pbkdf2:sha256:${PBKDF2_ITERATIONS}:${saltHex}:${hashHex}`;
}

// Verify password against stored hash
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split(":");
    if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[1] !== "sha256") {
      return false;
    }

    const iterations = parseInt(parts[2], 10);
    const saltHex = parts[3];
    const hashHex = parts[4];

    const salt = hexToBuf(saltHex);
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    const derivedKeyBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: iterations,
        hash: "SHA-256",
      },
      passwordKey,
      KEY_LEN * 8
    );

    const checkHashHex = bufToHex(derivedKeyBits);
    return checkHashHex === hashHex;
  } catch (e) {
    console.error("Password verification error:", e);
    return false;
  }
}

// Create signed session token (HMAC-SHA256)
export async function createSessionToken(
  payload: { email: string; role: string; exp: number },
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const header = { alg: "HS256", typ: "JWT" };
  const base64Header = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const base64Payload = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const unsignedToken = `${base64Header}.${base64Payload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(unsignedToken));
  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${unsignedToken}.${base64Signature}`;
}

// Verify signed session token
export async function verifySessionToken(
  token: string,
  secret: string
): Promise<{ email: string; role: string; exp: number } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const unsignedToken = `${headerB64}.${payloadB64}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Reconstruct signature buffer
    const signatureStr = atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/"));
    const signature = new Uint8Array(signatureStr.length);
    for (let i = 0; i < signatureStr.length; i++) {
      signature[i] = signatureStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(unsignedToken));
    if (!isValid) return null;

    const payloadStr = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadStr);

    if (payload.exp && Date.now() > payload.exp) {
      console.warn("Session token expired");
      return null;
    }

    return payload;
  } catch (e) {
    console.error("Session verification error:", e);
    return null;
  }
}
