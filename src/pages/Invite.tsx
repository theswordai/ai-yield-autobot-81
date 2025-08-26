import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { decodeAddress } from "@/lib/addressCode";

export default function Invite() {
  const params = useParams();
  const inviterParam = (params as any).inviter as string | undefined;
  const codeParam = (params as any).code as string | undefined;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let addr = inviterParam || "";
    if (!addr && codeParam) {
      try { addr = decodeAddress(codeParam); } catch {}
    }
    const isAddr = /^0x[a-fA-F0-9]{40}$/.test(addr);
    if (isAddr) {
      localStorage.setItem("inviter", addr.toLowerCase());
    }
    
    // 获取当前语言前缀
    const currentPath = location.pathname;
    const langMatch = currentPath.match(/^\/([a-z]{2})/);
    const langPrefix = langMatch ? `/${langMatch[1]}` : '/zh';
    
    // 如果是短码邀请链接 (/i/xxx)，跳转到 referral 页面
    const isShortCode = currentPath.includes('/i/');
    const targetPage = isShortCode ? 'user' : 'invest';
    const t = setTimeout(() => navigate(`${langPrefix}/${targetPage}?scrollToInviter=true`, { replace: true }), 400);
    return () => clearTimeout(t);
  }, [inviterParam, codeParam, navigate, location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-dark flex items-center justify-center">
      <Helmet>
        <title>正在处理邀请...</title>
        <meta name="description" content="正在记录邀请人并跳转到用户中心" />
      </Helmet>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <div className="text-center text-sm text-muted-foreground relative z-10">
        正在保存邀请信息并跳转...
      </div>
    </div>
  );
}
