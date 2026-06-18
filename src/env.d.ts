/// <reference types="astro/client" />

interface UserSession {
  email: string;
  role: string;
  exp: number;
}

declare namespace App {
  interface Locals {
    user?: UserSession;
  }
}
