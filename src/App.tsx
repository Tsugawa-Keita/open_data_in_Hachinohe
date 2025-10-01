import { useEffect, useState } from "react";

type Health = { status: string };

export default function App() {
  const [status, setStatus] = useState<"unknown" | "ok" | "ng">("unknown");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("未チェック");
  const [checking, setChecking] = useState(false);

  const ping = async () => {
    setChecking(true);
    setMessage("チェック中…");
    try {
      const start = performance.now();
      const res = await fetch("/api/health");
      const end = performance.now();
      setLatencyMs(Math.round(end - start));

      if (!res.ok) {
        setStatus("ng");
        setMessage(`HTTP ${res.status}`);
        return;
      }
      const data = (await res.json()) as Health;
      if (data?.status === "ok") {
        setStatus("ok");
        setMessage("正常");
      } else {
        setStatus("ng");
        setMessage(`応答: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      setStatus("ng");
      setMessage(err?.message ?? "通信エラー");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    // 初回に1回だけチェック
    ping();
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Health Check (React + FastAPI)</h1>

      <section
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 12,
          display: "grid",
          gap: 8,
        }}
      >
        <div>
          <strong>エンドポイント:</strong> <code>/api/health</code>
        </div>
        <div>
          <strong>ステータス:</strong>{" "}
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              background:
                status === "ok"
                  ? "#e6ffed"
                  : status === "ng"
                  ? "#ffecec"
                  : "#f3f4f6",
              border:
                status === "ok"
                  ? "1px solid #34d399"
                  : status === "ng"
                  ? "1px solid #f87171"
                  : "1px solid #d1d5db",
            }}
          >
            {status}
          </span>
        </div>
        <div>
          <strong>メッセージ:</strong> {message}
        </div>
        <div>
          <strong>レイテンシ:</strong>{" "}
          {latencyMs !== null ? `${latencyMs} ms` : "-"}
        </div>

        <div style={{ marginTop: 8 }}>
          <button onClick={ping} disabled={checking}>
            {checking ? "再チェック中…" : "再チェック"}
          </button>
        </div>
      </section>
    </main>
  );
}