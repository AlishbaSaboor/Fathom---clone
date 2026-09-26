import { destroySession } from "@/lib/server/auth";
import { errorResponse, json } from "@/lib/server/api";

export async function POST() {
  try {
    await destroySession();
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
