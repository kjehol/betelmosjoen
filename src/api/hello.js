// api/hello.js
export const config = { runtime: "edge" };

export default async function handler(request) {
  return new Response(JSON.stringify({ ok: true, message: "Hello from Vercel!" }), {
    headers: { "Content-Type": "application/json" },
  });
}
