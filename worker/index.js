/**
 * linao 的小窝 · 留言板后端
 * Cloudflare Worker + KV，匿名留言，无需注册。
 *
 * 绑定要求：
 *   KV 命名空间   GUESTBOOK   （存留言）
 *   Secret        ADMIN_TOKEN （可选，删除留言用）
 *
 * 路由：
 *   GET    /api/messages?limit=50   取留言（新的在前）
 *   POST   /api/messages            发留言 { name, text, mood, hp }
 *   DELETE /api/messages/<id>       删留言（需 X-Admin-Token）
 *   GET    /api/health              健康检查
 */

const MAX_NAME = 24;
const MAX_TEXT = 500;
const MAX_LINKS = 1;
const RATE_WINDOW = 300;      // 秒
const RATE_LIMIT = 5;         // 每个 IP 每个窗口最多几条
const MOODS = ["🌿", "☁️", "🌊", "🍃", "✨", "🐾", "🌙", "🍵"];

function corsHeaders(request) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
    "Access-Control-Max-Age": "86400"
  };
}

function json(data, status, extra) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }, extra || {})
  });
}

function clean(str, max) {
  if (typeof str !== "string") return "";
  // 去掉控制字符与不可见字符，压掉多余空行
  return str
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function countLinks(text) {
  const m = text.match(/https?:\/\//gi);
  return m ? m.length : 0;
}

function makeId() {
  const rand = Math.random().toString(36).slice(2, 8);
  return String(Date.now()).padStart(13, "0") + "-" + rand;
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      if (url.pathname === "/api/health") {
        return json({ ok: true, kv: !!env.GUESTBOOK }, 200, cors);
      }

      if (url.pathname === "/api/messages" && request.method === "GET") {
        const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 1), 100);
        const listed = await env.GUESTBOOK.list({ prefix: "msg:", limit: 1000 });
        const keys = listed.keys
          .map(function (k) { return k.name; })
          .sort()
          .reverse()
          .slice(0, limit);

        const items = await Promise.all(keys.map(function (key) {
          return env.GUESTBOOK.get(key, "json");
        }));

        return json({
          ok: true,
          total: listed.keys.length,
          messages: items.filter(Boolean)
        }, 200, cors);
      }

      if (url.pathname === "/api/messages" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch (e) {
          return json({ ok: false, error: "bad_json", message: "内容读不出来，刷新再试一次？" }, 400, cors);
        }

        // 蜜罐：真人看不到这个字段
        if (body.hp) {
          return json({ ok: false, error: "spam" }, 400, cors);
        }

        const name = clean(body.name, MAX_NAME) || "路过的人";
        const text = clean(body.text, MAX_TEXT);
        const mood = MOODS.indexOf(body.mood) >= 0 ? body.mood : "🌿";

        if (text.length < 1) {
          return json({ ok: false, error: "empty", message: "还没写字呢～" }, 400, cors);
        }
        if (countLinks(text) > MAX_LINKS) {
          return json({ ok: false, error: "too_many_links", message: "链接太多了，最多放一个哦" }, 400, cors);
        }

        // 按 IP 限流
        const ip = request.headers.get("CF-Connecting-IP") || "unknown";
        const rlKey = "rl:" + ip;
        const used = parseInt((await env.GUESTBOOK.get(rlKey)) || "0", 10);
        if (used >= RATE_LIMIT) {
          return json({ ok: false, error: "rate_limited", message: "说得太快啦，歇五分钟再来～" }, 429, cors);
        }
        await env.GUESTBOOK.put(rlKey, String(used + 1), { expirationTtl: RATE_WINDOW });

        const id = makeId();
        const record = {
          id: id,
          name: name,
          text: text,
          mood: mood,
          at: Date.now()
        };
        await env.GUESTBOOK.put("msg:" + id, JSON.stringify(record));

        return json({ ok: true, message: record }, 201, cors);
      }

      if (url.pathname.indexOf("/api/messages/") === 0 && request.method === "DELETE") {
        const token = request.headers.get("X-Admin-Token") || "";
        if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
          return json({ ok: false, error: "forbidden" }, 403, cors);
        }
        const id = url.pathname.replace("/api/messages/", "");
        await env.GUESTBOOK.delete("msg:" + id);
        return json({ ok: true }, 200, cors);
      }

      return json({ ok: false, error: "not_found", hint: "API 在 /api/messages" }, 404, cors);
    } catch (err) {
      return json({ ok: false, error: "server_error", detail: String(err && err.message || err) }, 500, cors);
    }
  }
};
