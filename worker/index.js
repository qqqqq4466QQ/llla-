/**
 * linao 的小窝 · 后端
 * 一个 Worker 管两件事：
 *   1) 匿名留言板（KV: GUESTBOOK）
 *   2) 相册（照片存同一个 KV，站长用 ADMIN_TOKEN 上传 / 删除）
 *
 * 绑定：
 *   KV 命名空间  GUESTBOOK   留言 + 照片元数据 + 照片二进制
 *   Secret       ADMIN_TOKEN 站长操作口令
 *
 * 留言接口：
 *   GET    /api/messages?limit=60
 *   POST   /api/messages            { name, text, mood, hp }
 *   DELETE /api/messages/<id>       X-Admin-Token
 *
 * 相册接口：
 *   GET    /api/photos?limit=100    公开，按时间倒序
 *   GET    /api/photos/<id>/raw     公开，直接是图片
 *   POST   /api/photos              X-Admin-Token，multipart: file + title + caption + tag
 *   DELETE /api/photos/<id>         X-Admin-Token
 *
 *   GET    /api/health
 */

const MAX_NAME = 24;
const MAX_TEXT = 500;
const MAX_LINKS = 1;
const RATE_WINDOW = 300;          // 秒
const RATE_LIMIT = 5;             // 每个 IP 每个窗口最多几条留言
const MOODS = ["🌿", "☁️", "🌊", "🍃", "✨", "🐾", "🌙", "🍵"];

const MAX_PHOTO_BYTES = 6 * 1024 * 1024;      // 单张最大 6 MB
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_TITLE = 60;
const MAX_CAPTION = 200;
const MAX_TAG = 16;

function corsHeaders() {
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

function makeId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8);
  return (prefix || "") + String(Date.now()).padStart(13, "0") + "-" + rand;
}

function isAdmin(request, env) {
  const token = request.headers.get("X-Admin-Token") || "";
  return !!(env.ADMIN_TOKEN && token === env.ADMIN_TOKEN);
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders();
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      /* ---------------- 健康检查 ---------------- */
      if (path === "/api/health") {
        return json({ ok: true, kv: !!env.GUESTBOOK, admin: !!env.ADMIN_TOKEN }, 200, cors);
      }

      /* ================= 留言板 ================= */
      if (path === "/api/messages" && request.method === "GET") {
        const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 1), 100);
        const listed = await env.GUESTBOOK.list({ prefix: "msg:", limit: 1000 });
        const keys = listed.keys.map(function (k) { return k.name; }).sort().reverse().slice(0, limit);
        const items = await Promise.all(keys.map(function (key) { return env.GUESTBOOK.get(key, "json"); }));
        return json({ ok: true, total: listed.keys.length, messages: items.filter(Boolean) }, 200, cors);
      }

      if (path === "/api/messages" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch (e) {
          return json({ ok: false, error: "bad_json", message: "内容读不出来，刷新再试一次？" }, 400, cors);
        }
        if (body.hp) return json({ ok: false, error: "spam" }, 400, cors);

        const name = clean(body.name, MAX_NAME) || "路过的人";
        const text = clean(body.text, MAX_TEXT);
        const mood = MOODS.indexOf(body.mood) >= 0 ? body.mood : "🌿";

        if (!text) return json({ ok: false, error: "empty", message: "还没写字呢～" }, 400, cors);
        if (countLinks(text) > MAX_LINKS) {
          return json({ ok: false, error: "too_many_links", message: "链接太多了，最多放一个哦" }, 400, cors);
        }

        const ip = request.headers.get("CF-Connecting-IP") || "unknown";
        const rlKey = "rl:" + ip;
        const used = parseInt((await env.GUESTBOOK.get(rlKey)) || "0", 10);
        if (used >= RATE_LIMIT) {
          return json({ ok: false, error: "rate_limited", message: "说得太快啦，歇五分钟再来～" }, 429, cors);
        }
        await env.GUESTBOOK.put(rlKey, String(used + 1), { expirationTtl: RATE_WINDOW });

        const id = makeId("");
        const record = { id: id, name: name, text: text, mood: mood, at: Date.now() };
        await env.GUESTBOOK.put("msg:" + id, JSON.stringify(record));
        return json({ ok: true, message: record }, 201, cors);
      }

      if (path.indexOf("/api/messages/") === 0 && request.method === "DELETE") {
        if (!isAdmin(request, env)) return json({ ok: false, error: "forbidden" }, 403, cors);
        const id = path.replace("/api/messages/", "");
        await env.GUESTBOOK.delete("msg:" + id);
        return json({ ok: true }, 200, cors);
      }

      /* ================= 相册 ================= */
      if (path === "/api/photos" && request.method === "GET") {
        const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 1), 200);
        const listed = await env.GUESTBOOK.list({ prefix: "photo:", limit: 1000 });
        const keys = listed.keys.map(function (k) { return k.name; }).sort().reverse().slice(0, limit);
        const items = await Promise.all(keys.map(function (key) { return env.GUESTBOOK.get(key, "json"); }));
        const photos = items.filter(Boolean).map(function (p) {
          p.url = "/api/photos/" + p.id + "/raw";
          return p;
        });
        return json({ ok: true, total: photos.length, photos: photos, admin: isAdmin(request, env) }, 200, cors);
      }

      if (path === "/api/photos" && request.method === "POST") {
        if (!isAdmin(request, env)) {
          return json({ ok: false, error: "forbidden", message: "口令不对，或者没填口令" }, 403, cors);
        }

        let form;
        try {
          form = await request.formData();
        } catch (e) {
          return json({ ok: false, error: "bad_form", message: "上传格式不对" }, 400, cors);
        }

        const file = form.get("file");
        if (!file || typeof file === "string") {
          return json({ ok: false, error: "no_file", message: "没收到图片文件" }, 400, cors);
        }

        const type = file.type || "image/jpeg";
        if (PHOTO_TYPES.indexOf(type) < 0) {
          return json({ ok: false, error: "bad_type", message: "只支持 jpg / png / webp / gif" }, 400, cors);
        }

        const buf = await file.arrayBuffer();
        if (buf.byteLength > MAX_PHOTO_BYTES) {
          return json({ ok: false, error: "too_large", message: "图片太大了，压一下再传（上限 6 MB）" }, 400, cors);
        }

        const id = makeId("");
        const meta = {
          id: id,
          title: clean(form.get("title"), MAX_TITLE) || "未命名",
          caption: clean(form.get("caption"), MAX_CAPTION),
          tag: clean(form.get("tag"), MAX_TAG) || "随手拍",
          type: type,
          size: buf.byteLength,
          at: Date.now()
        };

        await env.GUESTBOOK.put("blob:" + id, buf);
        await env.GUESTBOOK.put("photo:" + id, JSON.stringify(meta));

        meta.url = "/api/photos/" + id + "/raw";
        return json({ ok: true, photo: meta }, 201, cors);
      }

      const rawMatch = path.match(/^\/api\/photos\/([^/]+)\/raw$/);
      if (rawMatch && request.method === "GET") {
        const id = rawMatch[1];
        const meta = await env.GUESTBOOK.get("photo:" + id, "json");
        if (!meta) return new Response("not found", { status: 404, headers: cors });
        const blob = await env.GUESTBOOK.get("blob:" + id, "arrayBuffer");
        if (!blob) return new Response("not found", { status: 404, headers: cors });
        return new Response(blob, {
          status: 200,
          headers: Object.assign({
            "Content-Type": meta.type || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Length": String(blob.byteLength),
            "ETag": '"' + id + '"'
          }, cors)
        });
      }

      const photoMatch = path.match(/^\/api\/photos\/([^/]+)$/);
      if (photoMatch && request.method === "DELETE") {
        if (!isAdmin(request, env)) return json({ ok: false, error: "forbidden" }, 403, cors);
        const id = photoMatch[1];
        await env.GUESTBOOK.delete("blob:" + id);
        await env.GUESTBOOK.delete("photo:" + id);
        return json({ ok: true, deleted: id }, 200, cors);
      }

      return json({ ok: false, error: "not_found", hint: "/api/messages · /api/photos" }, 404, cors);
    } catch (err) {
      return json({ ok: false, error: "server_error", detail: String((err && err.message) || err) }, 500, cors);
    }
  }
};
