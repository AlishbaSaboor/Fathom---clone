/**
 * Copies text, and when `html` is given also an HTML version, so pasting into
 * Gmail, Google Docs or Word keeps real headings and lists while a plain-text
 * target still gets the text. Falls back to plain text when the browser can't
 * write rich clipboard data. Returns false if nothing could be copied.
 */
export async function copyRich(plain: string, html?: string): Promise<boolean> {
  try {
    if (html && typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([plain], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ]);
      return true;
    }
  } catch {
    // fall through to plain text
  }
  try {
    await navigator.clipboard.writeText(plain);
    return true;
  } catch {
    return false;
  }
}
