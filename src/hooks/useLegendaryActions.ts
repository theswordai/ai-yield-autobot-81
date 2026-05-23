import { useCallback, useState } from "react";
import { MaxUint256, isAddress, parseUnits } from "ethers";
import { toast } from "sonner";
import { useWeb3 } from "./useWeb3";
import { useLegendaryContracts } from "./useLegendary";
import { LEGENDARY_STAKING_ADDRESS } from "@/config/legendary";

const REVERT_MAP: Record<string, string> = {
  "below min": "金额低于最低门槛",
  "not authorized": "未授权操作",
  frozen: "账户已被冻结",
  paused: "合约已暂停",
  "already bound": "已绑定过上线",
  "self bind": "不能绑定自己为上线",
  "inviter below min": "上线自投不足 200 USDT",
  "cooldown": "未到下一次领取时间",
  "not matured": "锁仓未到期",
  "pool2 only compound": "二池仅支持复投进入",
  "insufficient interest": "未领利息不足",
};

function parseRevert(err: any): string {
  const raw =
    err?.shortMessage ||
    err?.reason ||
    err?.data?.message ||
    err?.error?.message ||
    err?.message ||
    "";
  const low = String(raw).toLowerCase();
  for (const k of Object.keys(REVERT_MAP)) {
    if (low.includes(k)) return REVERT_MAP[k];
  }
  if (low.includes("user rejected") || low.includes("user denied")) return "用户取消了交易";
  return "交易失败，请稍后重试";
}

export function useLegendaryActions(onDone?: () => void) {
  const { account } = useWeb3();
  const { write } = useLegendaryContracts();
  const [busy, setBusy] = useState<string | null>(null);

  const ensure = useCallback(() => {
    if (!write || !account) {
      toast.error("请先连接钱包");
      return false;
    }
    return true;
  }, [write, account]);

  const run = useCallback(
    async (key: string, fn: () => Promise<any>, okMsg: string) => {
      if (!ensure()) return false;
      setBusy(key);
      const id = toast.loading("交易处理中...");
      try {
        const tx = await fn();
        if (tx?.wait) await tx.wait();
        toast.success(okMsg, { id });
        onDone?.();
        return true;
      } catch (e: any) {
        toast.error(parseRevert(e), { id });
        return false;
      } finally {
        setBusy(null);
      }
    },
    [ensure, onDone]
  );

  const approveIfNeeded = useCallback(
    async (amountWei: bigint, currentAllowance: bigint) => {
      if (!write) return false;
      if (currentAllowance >= amountWei) return true;
      const ok = await run(
        "approve",
        () => write.usdt.approve(LEGENDARY_STAKING_ADDRESS, MaxUint256),
        "授权成功"
      );
      return ok;
    },
    [write, run]
  );

  const deposit = useCallback(
    async (amountStr: string, currentAllowance: bigint) => {
      if (!write) return;
      let amountWei: bigint;
      try {
        amountWei = parseUnits(amountStr || "0", 18);
      } catch {
        toast.error("金额格式有误");
        return;
      }
      if (amountWei <= 0n) return toast.error("请输入有效金额");
      const ok = await approveIfNeeded(amountWei, currentAllowance);
      if (!ok) return;
      return run("deposit", () => write.staking.deposit(amountWei), "存款成功");
    },
    [write, approveIfNeeded, run]
  );

  const claimInterest = useCallback(
    (posIds: bigint[]) => {
      if (!write || posIds.length === 0) return;
      return run("claimInterest", () => write.staking.claimInterest(posIds), "利息已到账");
    },
    [write, run]
  );

  const withdraw = useCallback(
    (posId: bigint) => {
      if (!write) return;
      return run("withdraw", () => write.staking.withdraw(posId), "本金已取回");
    },
    [write, run]
  );

  const earlyWithdraw = useCallback(
    (posId: bigint) => {
      if (!write) return;
      return run(
        "early",
        () => write.staking.earlyWithdraw(posId),
        "已提前赎回（扣 50% 本金）"
      );
    },
    [write, run]
  );

  const compoundToPool2 = useCallback(
    (posIds: bigint[], amountStr: string) => {
      if (!write) return;
      let amountWei: bigint;
      try {
        amountWei = parseUnits(amountStr || "0", 18);
      } catch {
        toast.error("金额格式有误");
        return;
      }
      if (amountWei <= 0n) return toast.error("请输入有效金额");
      return run(
        "compound",
        () => write.staking.compoundToPool2(posIds, amountWei),
        "复投到二池成功"
      );
    },
    [write, run]
  );

  const claimRewards = useCallback(() => {
    if (!write) return;
    return run("claimRewards", () => write.staking.claimRewards(), "奖励已领取");
  }, [write, run]);

  const bind = useCallback(
    async (inviter: string) => {
      if (!write) return;
      if (!isAddress(inviter)) {
        toast.error("地址格式错误");
        return;
      }
      if (account && inviter.toLowerCase() === account.toLowerCase()) {
        toast.error("不能绑定自己为上线");
        return;
      }
      return run("bind", () => write.referral.bind(inviter), "上线绑定成功");
    },
    [write, account, run]
  );

  const approve = useCallback(async () => {
    if (!write) return false;
    return run(
      "approve",
      () => write.usdt.approve(LEGENDARY_STAKING_ADDRESS, MaxUint256),
      "授权成功"
    );
  }, [write, run]);

  return {
    busy,
    deposit,
    approve,
    claimInterest,
    withdraw,
    earlyWithdraw,
    compoundToPool2,
    claimRewards,
    bind,
  };
}

