import { Contract, BrowserProvider } from "ethers";
import { MockUSDT_ABI } from "@/abis/MockUSDT";
import { USDT_ADDRESS, USDT_DECIMALS } from "@/config/contracts";
import { rpcClient } from "@/lib/rpcClient";

export async function validateUSDTContract(provider: BrowserProvider): Promise<{
  isValid: boolean;
  error?: string;
  details?: {
    name?: string;
    symbol?: string;
    decimals?: number;
    totalSupply?: string;
  };
}> {
  try {
    console.log("🔍 验证 USDT 合约:", USDT_ADDRESS);
    
    // 使用 fallback RPC 检查合约地址是否有代码
    const codeResult = await rpcClient.getCodeSafe(USDT_ADDRESS);
    
    if (!codeResult.success) {
      console.error("❌ RPC 连接失败:", codeResult.error);
      return {
        isValid: false,
        error: codeResult.error || "RPC 连接失败"
      };
    }
    
    if (codeResult.code === '0x') {
      return {
        isValid: false,
        error: "合约地址没有部署代码"
      };
    }
    
    console.log("✅ 合约地址有代码，长度:", codeResult.code!.length);
    console.log(`📡 使用 RPC: ${codeResult.usedProvider}`);
    
    // 创建合约实例，使用 fallback provider
    const fallbackProvider = rpcClient.getCurrentProvider();
    const contract = new Contract(USDT_ADDRESS, MockUSDT_ABI, fallbackProvider);
    
    // 测试基本 ERC-20 方法
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name().catch(() => "Unknown"),
      contract.symbol().catch(() => "Unknown"), 
      contract.decimals().catch(() => 0),
      contract.totalSupply().catch(() => "0"),
    ]);
    
    console.log("📊 合约信息:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Decimals:", decimals);
    console.log("- Total Supply:", totalSupply.toString());
    
    // 验证小数位数是否匹配配置
    if (Number(decimals) !== USDT_DECIMALS) {
      console.warn(`⚠️ 小数位数不匹配: 合约=${decimals}, 配置=${USDT_DECIMALS}`);
    }
    
    return {
      isValid: true,
      details: {
        name: String(name),
        symbol: String(symbol),
        decimals: Number(decimals),
        totalSupply: String(totalSupply),
      }
    };
    
  } catch (error: any) {
    console.error("❌ USDT 合约验证失败:", error);
    return {
      isValid: false,
      error: error.message || "合约验证失败"
    };
  }
}

export async function testContractCall(
  provider: BrowserProvider,
  account: string
): Promise<{ success: boolean; balance?: string; error?: string }> {
  try {
    console.log("🧪 测试合约调用 - 查询余额");
    
    // 使用 fallback provider 而不是传入的 provider
    const fallbackProvider = rpcClient.getCurrentProvider();
    const contract = new Contract(USDT_ADDRESS, MockUSDT_ABI, fallbackProvider);
    const balance = await contract.balanceOf(account);
    
    console.log("✅ 余额查询成功:", balance.toString());
    console.log(`📡 使用 RPC: ${rpcClient.getCurrentProviderName()}`);
    
    return {
      success: true,
      balance: balance.toString()
    };
    
  } catch (error: any) {
    console.error("❌ 合约调用失败:", error);
    
    // 如果是 RPC 错误，给出更友好的提示
    const isRpcError = error.code === "UNKNOWN_ERROR" || 
                      error.message?.includes("Internal JSON-RPC error") ||
                      error.message?.includes("empty reader set");
    
    const errorMessage = isRpcError 
      ? "节点拥堵，请稍后重试或切换网络"
      : error.message;
    
    return {
      success: false,
      error: errorMessage
    };
  }
}