import { useWeb3 } from "@/hooks/useWeb3";
import { useBlockedWallet } from "@/hooks/useBlockedWallet";

export function WalletAccessGate() {
  const { account } = useWeb3();
  const { blocked } = useBlockedWallet(account);

  if (!blocked) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: "#ffffff",
        color: "#202124",
        fontFamily:
          'Arial, "Helvetica Neue", Helvetica, sans-serif',
      }}
      aria-hidden="true"
    >
      <div style={{ maxWidth: 600, padding: "0 24px", width: "100%" }}>
        {/* Chrome offline dino-ish icon */}
        <div
          aria-hidden="true"
          style={{
            width: 72,
            height: 72,
            marginBottom: 28,
            opacity: 0.85,
          }}
        >
          <svg viewBox="0 0 48 48" width="72" height="72" fill="#9aa0a6">
            <path d="M24 4c-1.66 0-3 1.34-3 3v3h-3a3 3 0 0 0-3 3v6h-3a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h2v4a3 3 0 0 0 3 3h3v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-3h4a3 3 0 0 0 3-3v-4h2a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-3v-6a3 3 0 0 0-3-3h-3V7c0-1.66-1.34-3-3-3h-6zm3 12a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 400,
            margin: "0 0 16px",
            color: "#202124",
            lineHeight: 1.3,
          }}
        >
          无法访问此网站
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "#5f6368",
            margin: "0 0 28px",
          }}
        >
          请尝试以下操作:
          <br />· 检查网络连接
          <br />· 检查代理服务器和防火墙
          <br />· 运行 Windows 网络诊断
        </p>

        <p
          style={{
            fontSize: 12,
            color: "#80868b",
            margin: "0 0 32px",
            letterSpacing: 0.5,
          }}
        >
          DNS_PROBE_FINISHED_NXDOMAIN
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: "#1a73e8",
            color: "#ffffff",
            border: "none",
            borderRadius: 4,
            padding: "9px 16px",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          重新加载
        </button>
      </div>
    </div>
  );
}
