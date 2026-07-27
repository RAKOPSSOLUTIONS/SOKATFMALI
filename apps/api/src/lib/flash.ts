import { cookies } from "next/headers";

export type FlashType = "success" | "error" | "info";

/**
 * Queue a snackbar message that survives a redirect. Written to a short-lived,
 * non-httpOnly cookie that the client <Toaster> reads on the next navigation
 * and then clears. Best-effort — never throws.
 */
export async function setFlash(message: string, type: FlashType = "success"): Promise<void> {
  try {
    const jar = await cookies();
    jar.set("sokatf_flash", encodeURIComponent(JSON.stringify({ message, type })), {
      path: "/",
      maxAge: 15,
      httpOnly: false,
      sameSite: "lax",
    });
  } catch {
    /* called outside a request scope — ignore */
  }
}
