# 留言板后端（Cloudflare Worker + KV）

线上地址：**https://linao-guestbook.ningfu334.workers.dev**

| 项 | 值 |
|---|---|
| Worker 名 | `linao-guestbook` |
| KV 命名空间 | `GUESTBOOK`（id `b8448ec275104bb687088a06a1df2e73`） |
| 绑定 | `GUESTBOOK` → 上面那个 KV |
| Secret | `ADMIN_TOKEN`（删留言用，只存在 Cloudflare，不进仓库） |

## 接口

```http
GET    /api/health                     健康检查
GET    /api/messages?limit=60          取留言（新的在前）
POST   /api/messages                   发留言
       body: {"name":"昵称","text":"内容","mood":"🌿","hp":""}
DELETE /api/messages/<id>              删留言（头里带 X-Admin-Token）
```

## 规则

- 昵称不填 → `路过的人`；名字最长 24 字，内容最长 500 字
- 每条最多 1 个链接，超了直接拒
- 同一 IP 5 分钟内最多 5 条（`429`）
- 蜜罐字段 `hp` 有值 → 判定机器人
- 内容原样存储，前端渲染时转义，避免 XSS

## 已知特性

KV 的 `list` 是**最终一致**的：刚发出去的留言，别的访客可能要等 30～60 秒才在列表里看到。
前端做了乐观更新（发完立刻插到列表里、并标记「刚刚 · 发送成功」），所以发的人不会有「我是不是没发出去」的错觉。
想彻底改成强一致，可以换 D1（需要给 token 加 D1 权限）。

## 重新部署

```powershell
$env:CLOUDFLARE_API_TOKEN = "你的 token"
.\deploy.ps1
```

或者用 wrangler：先把 `wrangler.toml` 里的 KV id 换成真的，然后 `wrangler deploy`。
