import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { decodeAddress } from "@/lib/addressCode";
import InvitationLandingPage from "@/components/InvitationLandingPage";

export default function Invite() {
  const params = useParams();
  const inviterParam = (params as any).inviter as string | undefined;
  const codeParam = (params as any).code as string | undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const [showLanding, setShowLanding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Process inviter information
    let addr = inviterParam || "";
    if (!addr && codeParam) {
      try { addr = decodeAddress(codeParam); } catch {}
    }
    const isAddr = /^0x[a-fA-F0-9]{40}$/.test(addr);
    if (isAddr) {
      localStorage.setItem("inviter", addr.toLowerCase());
    }
    
    // Show landing page after brief processing
    const timer = setTimeout(() => {
      setIsProcessing(false);
      setShowLanding(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [inviterParam, codeParam]);

  const handleClose = () => {
    // Get current language prefix
    const currentPath = location.pathname;
    const langMatch = currentPath.match(/^\/([a-z]{2})/);
    const langPrefix = langMatch ? `/${langMatch[1]}` : '/zh';
    
    navigate(`${langPrefix}/invest`, { replace: true });
  };

  const handleProceed = () => {
    // Get current language prefix
    const currentPath = location.pathname;
    const langMatch = currentPath.match(/^\/([a-z]{2})/);
    const langPrefix = langMatch ? `/${langMatch[1]}` : '/zh';
    
    navigate(`${langPrefix}/invest?scrollToInviter=true`, { replace: true });
  };

  if (isProcessing) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-dark flex items-center justify-center">
        <Helmet>
          <title>正在处理邀请...</title>
          <meta name="description" content="正在记录邀请人信息" />
        </Helmet>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
        <div className="text-center text-sm text-muted-foreground relative z-10">
          正在保存邀请信息...
        </div>
      </div>
    );
  }

  if (showLanding) {
    return (
      <>
        <Helmet>
          <title>数美在线 · USDV 的孵化器</title>
          <meta name="description" content="通往 USDV 的唯一入口，驱动文明级财富裂变的终极引擎" />
        </Helmet>
        <InvitationLandingPage 
          onClose={handleClose} 
          onProceed={handleProceed} 
        />
      </>
    );
  }

  return null;
}
