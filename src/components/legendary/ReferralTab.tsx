import { useEffect, useMemo, useState } from "react";
import { isAddress } from "ethers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Users } from "lucide-react";
import { toast } from "sonner";
import { useWeb3 } from "@/hooks/useWeb3";
import { useLegendaryContracts, useLegendaryDashboard, fmt } from "@/hooks/useLegendary";
import { useLegendaryActions } from "@/hooks/useLegendaryActions";

const ZERO = "0x0000000000000000000000000000000000000000";

type DirectInfo = {
  addr: string;
  selfStake: bigint;
  teamPerf: bigint;
};

const PAGE_SIZE = 20;

export function ReferralTab() {
  const { account, connect } = useWeb3();
  const { read } = useLegendaryContracts();
  const { data, refetch } = useLegendaryDashboard();
  const { bind, busy } = useLegendaryActions(refetch);
  const [inviterInput, setInviterInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [directs, setDirects] = useState<DirectInfo[]>([]);
  const [page, setPage] = useState(1);

  // 网络树（手动查询，不自动刷新）
  type TreeNodeData = { selfStake: bigint; children: string[]; level: number };
  type NetworkTree = {
    root: string;
    nodes: Map<string, TreeNodeData>;
    totalCount: number;
    maxDepth: number;
    totalSelfStake: bigint;
    truncated: boolean;
  };
  const [tree, setTree] = useState<NetworkTree | null>(null);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeProgress, setTreeProgress] = useState(0);

  const MAX_NODES = 1000;
  const MAX_DEPTH = 10;
  const BATCH = 10;

  const loadNetworkTree = async () => {
    if (!read || !account) return;
    setTreeLoading(true);
    setTreeProgress(0);
    setTree(null);
    try {
      const nodes = new Map<string, TreeNodeData>();
      const visited = new Set<string>([account.toLowerCase()]);
      // 根节点
      const rootSelf: bigint = await read.referral.selfStake(account).then((v: any) => BigInt(v ?? 0)).catch(() => 0n);
      const rootChildren: string[] = await read.referral.getDirects(account).catch(() => []);
      nodes.set(account.toLowerCase(), { selfStake: rootSelf, children: rootChildren, level: 0 });
      setTreeProgress(1);

      let frontier: { addr: string; level: number }[] = rootChildren
        .filter((c) => {
          const k = c.toLowerCase();
          if (visited.has(k)) return false;
          visited.add(k);
          return true;
        })
        .map((c) => ({ addr: c, level: 1 }));

      let truncated = false;
      let maxDepth = rootChildren.length > 0 ? 1 : 0;
      let totalSelfStake: bigint = rootSelf;

      while (frontier.length > 0) {
        const nextFrontier: { addr: string; level: number }[] = [];
        for (let i = 0; i < frontier.length; i += BATCH) {
          const batch = frontier.slice(i, i + BATCH);
          const results = await Promise.all(
            batch.map(async ({ addr, level }) => {
              const [s, ch] = await Promise.all([
                read.referral.selfStake(addr).then((v: any) => BigInt(v ?? 0)).catch(() => 0n),
                level < MAX_DEPTH
                  ? read.referral.getDirects(addr).catch(() => [] as string[])
                  : Promise.resolve([] as string[]),
              ]);
              return { addr, level, selfStake: s as bigint, children: ch as string[] };
            })
          );
          for (const r of results) {
            if (nodes.size >= MAX_NODES) {
              truncated = true;
              break;
            }
            nodes.set(r.addr.toLowerCase(), {
              selfStake: r.selfStake,
              children: r.children,
              level: r.level,
            });
            totalSelfStake += r.selfStake;
            if (r.level > maxDepth) maxDepth = r.level;
            for (const c of r.children) {
              const k = c.toLowerCase();
              if (visited.has(k)) continue;
              visited.add(k);
              nextFrontier.push({ addr: c, level: r.level + 1 });
            }
          }
          setTreeProgress(nodes.size);
          if (truncated) break;
        }
        if (truncated) break;
        frontier = nextFrontier;
      }

      setTree({
        root: account,
        nodes,
        totalCount: nodes.size - 1, // 不计根节点
        maxDepth,
        totalSelfStake: (totalSelfStake - rootSelf) as bigint,
        truncated,
      });
    } catch {
      toast.error("查询失败，请稍后重试");
    } finally {
      setTreeLoading(false);
    }
  };

  // 从 URL ?ref=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && isAddress(ref) && data.inviter === ZERO) {
      setInviterInput(ref);
    }
  }, [data.inviter]);

  // 加载直推列表详情
  useEffect(() => {
    (async () => {
      if (!read || !account) {
        setDirects([]);
        setPage(1);
        return;
      }
      try {
        const list: string[] = await read.referral.getDirects(account);
        const infos = await Promise.all(
          list.map(async (addr) => {
            const [ss, tp] = await Promise.all([
              read.referral.selfStake(addr).catch(() => 0n),
              read.referral.teamPerf(addr).catch(() => 0n),
            ]);
            return { addr, selfStake: ss, teamPerf: tp };
          })
        );
        setDirects(infos);
        setPage(1);
      } catch {
        setDirects([]);
        setPage(1);
      }
    })();
  }, [read, account, data]);

  const myLink = useMemo(() => {
    if (!account) return "";
    return `${window.location.origin}/?ref=${account}`;
  }, [account]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(myLink);
      setCopied(true);
      toast.success("已复制邀请链接");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("复制失败");
    }
  };

  if (!account) {
    return (
      <Card className="p-8 bg-foreground/5 backdrop-blur-xl border-foreground/15 text-center">
        <p className="text-muted-foreground mb-4">连接钱包查看团队与邀请数据</p>
        <Button onClick={() => connect()} className="bg-gradient-to-r from-amber-500 to-yellow-600">
          连接钱包
        </Button>
      </Card>
    );
  }

  const bound = data.inviter !== ZERO;

  return (
    <div className="space-y-4">


      {/* 邀请链接 */}
      <Card className="p-4 bg-foreground/5 backdrop-blur-xl border-foreground/15">
        <h3 className="font-bold mb-3">我的邀请链接</h3>
        <div className="flex gap-2">
          <Input value={myLink} readOnly className="font-mono text-xs" />
          <Button variant="outline" onClick={onCopy} className="border-white/20">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </Card>

      {/* 团队总览 */}
      <Card className="p-4 bg-foreground/5 backdrop-blur-xl border-foreground/15">
        <h3 className="font-bold mb-3">团队总览</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">自投 selfStake</div>
            <div className="font-bold text-amber-600 dark:text-amber-400">{fmt(data.selfStake, 0)} USDT</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">团队业绩 teamPerf</div>
            <div className="font-bold">{fmt(data.teamPerf, 0)} USDT</div>
          </div>
        </div>
      </Card>

      {/* 直推列表 */}
      <Card className="p-4 bg-foreground/5 backdrop-blur-xl border-foreground/15">
        <h3 className="font-bold mb-3">我的直推（{directs.length}）</h3>
        {directs.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">暂无直推</div>
        ) : (
          <>
            <div className="space-y-2">
              {directs.slice(0, page * PAGE_SIZE).map((d) => (
                <div
                  key={d.addr}
                  className="flex items-center gap-3 p-2 rounded bg-foreground/5 text-xs"
                >
                  <span className="font-mono">
                    {d.addr.slice(0, 6)}...{d.addr.slice(-4)}
                  </span>
                  <span className="ml-auto text-muted-foreground">
                    自投 {fmt(d.selfStake, 1)} · 业绩 {fmt(d.teamPerf, 1)}
                  </span>
                </div>
              ))}
            </div>
            {page * PAGE_SIZE < directs.length && (
              <div className="mt-3 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20"
                  onClick={() => setPage((p) => p + 1)}
                >
                  加载更多（{Math.min(page * PAGE_SIZE, directs.length)}/{directs.length}）
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* 我的网络树 */}
      <Card className="p-4 bg-foreground/5 backdrop-blur-xl border-foreground/15">
        <div className="flex items-center gap-2 mb-2">
          <Network className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold">我的网络树</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          显示当前钱包地址下的全部下级（递归到底），仅在点击查询时加载，不自动刷新。
        </p>

        {!tree && !treeLoading && (
          <Button
            onClick={loadNetworkTree}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-background"
          >
            <Network className="w-4 h-4 mr-2" />
            查询我的网络树
          </Button>
        )}

        {treeLoading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            已加载 {treeProgress} 个地址…
          </div>
        )}

        {tree && !treeLoading && (
          <>
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div className="rounded bg-foreground/5 p-2">
                <div className="text-muted-foreground">总人数</div>
                <div className="font-bold">{tree.totalCount}</div>
              </div>
              <div className="rounded bg-foreground/5 p-2">
                <div className="text-muted-foreground">最大深度</div>
                <div className="font-bold">{tree.maxDepth}</div>
              </div>
              <div className="rounded bg-foreground/5 p-2">
                <div className="text-muted-foreground">团队自投合计</div>
                <div className="font-bold text-amber-600 dark:text-amber-400">
                  {fmt(tree.totalSelfStake, 0)}
                </div>
              </div>
            </div>

            {tree.truncated && (
              <Alert className="mb-3 border-amber-400/40 bg-amber-400/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  已达节点上限（{MAX_NODES}），部分深层下级未展示。
                </AlertDescription>
              </Alert>
            )}

            <div className="max-h-[480px] overflow-auto rounded border border-foreground/10 bg-background/40 p-2">
              <TreeRow addr={tree.root} depth={0} nodes={tree.nodes} isRoot />
            </div>

            <div className="mt-3 text-center">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20"
                onClick={loadNetworkTree}
              >
                重新查询
              </Button>
            </div>
          </>
        )}
      </Card>

    </div>
  );
}

function TreeRow({
  addr,
  depth,
  nodes,
  isRoot = false,
}: {
  addr: string;
  depth: number;
  nodes: Map<string, { selfStake: bigint; children: string[]; level: number }>;
  isRoot?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const node = nodes.get(addr.toLowerCase());
  if (!node) return null;
  const children = node.children.filter((c) => nodes.has(c.toLowerCase()));
  const hasChildren = children.length > 0;

  const copyAddr = async () => {
    try {
      await navigator.clipboard.writeText(addr);
      toast.success("地址已复制");
    } catch {
      // silent
    }
  };

  return (
    <div className="text-xs" style={{ paddingLeft: depth === 0 ? 0 : 12 }}>
      <div
        className={`flex items-center gap-2 py-1.5 px-1 rounded hover:bg-foreground/5 border-l ${
          depth === 0 ? "border-transparent" : "border-foreground/10"
        }`}
      >
        <button
          type="button"
          onClick={() => hasChildren && setOpen((v) => !v)}
          className="w-4 h-4 inline-flex items-center justify-center text-muted-foreground shrink-0"
        >
          {hasChildren ? (
            open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
          ) : (
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          )}
        </button>
        <span className="font-mono text-[10px] text-muted-foreground shrink-0">
          L{node.level}
        </span>
        <button
          type="button"
          onClick={copyAddr}
          className="font-mono hover:text-amber-500 transition-colors shrink-0"
          title={isRoot ? `${addr}（我）` : addr}
        >
          {addr.slice(0, 6)}...{addr.slice(-4)}
          {isRoot && <span className="ml-1 text-amber-500">（我）</span>}
        </button>
        <span className="ml-auto text-muted-foreground whitespace-nowrap">
          自投 <span className="text-foreground font-semibold">{fmt(node.selfStake, 1)}</span>
          {hasChildren && <span className="ml-2">· 直推 {children.length}</span>}
        </span>
      </div>
      {hasChildren && open && (
        <div>
          {children.map((c) => (
            <TreeRow key={c} addr={c} depth={depth + 1} nodes={nodes} />
          ))}
        </div>
      )}
    </div>
  );
}

