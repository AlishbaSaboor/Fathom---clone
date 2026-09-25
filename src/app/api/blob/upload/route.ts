import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { GeminiError } from "@/lib/gemini/errors";
import { authorizeBlobUpload } from "@/lib/meetings";
import { enforceRateLimit, errorResponse, json, readJson } from "@/lib/server/api";
import { requireOwnerId } from "@/lib/server/owner";

// Issues the short-lived token the browser uploads a recording to Blob with (a
// recording is far over the 4.5 MB a function request may carry, so it goes
// straight from the browser to Blob). A token is only issued for a file this
// visitor registered in step 1, for exactly that pathname, that content type
// and no more than the size declared there.
//
// Blob also calls this route when an upload finishes; nothing is recorded from
// that call, because it cannot reach a local dev server. The server instead
// looks the file up itself when the browser says the upload is done (see
// attachUpload in lib/meetings.ts).
export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "blob-token", 20, 10 * 60_000);
    const body = (await readJson(request, 10_000)) as unknown as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const ownerId = await requireOwnerId();
        if (typeof clientPayload !== "string") throw new GeminiError("invalid_input");
        const { contentType, maxBytes } = await authorizeBlobUpload(clientPayload, ownerId, pathname);
        return {
          allowedContentTypes: [contentType],
          maximumSizeInBytes: maxBytes,
          addRandomSuffix: false, // the pathname already contains a random token
          allowOverwrite: false,
          validUntil: Date.now() + 2 * 60 * 60_000,
        };
      },
    });
    return json(result);
  } catch (e) {
    return errorResponse(e);
  }
}
