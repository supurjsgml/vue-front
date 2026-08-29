export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!body) {
    return { ok: false };
  }

  logClientError(body);
  return { ok: true };
});
