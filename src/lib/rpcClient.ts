import { BrowserProvider, JsonRpcProvider } from "ethers";

export interface RpcConfig {
  url: string;
  name: string;
}

export class FallbackRpcClient {
  private providers: JsonRpcProvider[] = [];
  private configs: RpcConfig[] = [];
  private currentProviderIndex = 0;

  constructor() {
    // 定义RPC端点配置
    this.configs = [
      { url: "https://bsc-dataseed.binance.org/", name: "Binance" },
      { url: "https://bsc-dataseed1.defibit.io/", name: "DeFiBit" },
      { url: "https://bsc-dataseed1.ninicoin.io/", name: "NiniCoin" },
    ];

    // 创建provider实例
    this.providers = this.configs.map(config => new JsonRpcProvider(config.url, 56));
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getRetryDelay(attempt: number): number {
    // 指数退避: 300ms, 900ms, 2100ms
    return 300 * Math.pow(3, attempt);
  }

  async validateChainId(): Promise<{ isValid: boolean; actualChainId?: number; error?: string }> {
    try {
      const chainId = await this.providers[this.currentProviderIndex].getNetwork();
      const actualChainId = Number(chainId.chainId);
      
      if (actualChainId !== 56) {
        return {
          isValid: false,
          actualChainId,
          error: "请切换到 BNB Chain (BSC 主网)"
        };
      }

      return { isValid: true, actualChainId };
    } catch (error: any) {
      return {
        isValid: false,
        error: `网络检查失败: ${error.message}`
      };
    }
  }

  async getCodeSafe(address: string): Promise<{
    success: boolean;
    code?: string;
    error?: string;
    usedProvider?: string;
  }> {
    // 首先验证链ID
    const chainValidation = await this.validateChainId();
    if (!chainValidation.isValid) {
      return {
        success: false,
        error: chainValidation.error
      };
    }

    let lastError: Error | null = null;
    
    // 尝试所有provider
    for (let providerIndex = 0; providerIndex < this.providers.length; providerIndex++) {
      const provider = this.providers[providerIndex];
      const config = this.configs[providerIndex];
      
      console.log(`🔍 尝试使用 RPC: ${config.name} (${config.url})`);
      
      // 对每个provider重试3次
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          if (attempt > 0) {
            const delay = this.getRetryDelay(attempt - 1);
            console.log(`⏳ ${config.name} 重试 ${attempt}/3，等待 ${delay}ms...`);
            await this.delay(delay);
          }

          const code = await provider.getCode(address);
          
          // 成功获取代码
          this.currentProviderIndex = providerIndex; // 记住成功的provider
          console.log(`✅ 成功使用 ${config.name} 获取合约代码`);
          
          return {
            success: true,
            code,
            usedProvider: config.name
          };

        } catch (error: any) {
          lastError = error;
          console.warn(`❌ ${config.name} 第 ${attempt + 1} 次尝试失败:`, error.message);
          
          // 检查是否是已知的RPC错误
          const isRpcError = error.code === "UNKNOWN_ERROR" || 
                           error.message?.includes("Internal JSON-RPC error") ||
                           error.message?.includes("empty reader set") ||
                           error.message?.includes("pebble: not found");
          
          if (!isRpcError && attempt === 0) {
            // 如果不是RPC错误，直接跳到下一个provider
            break;
          }
        }
      }
    }

    // 所有provider都失败了
    console.error("❌ 所有 RPC 节点都失败了");
    
    return {
      success: false,
      error: `节点拥堵，请稍后重试或切换网络。最后错误: ${lastError?.message || "未知错误"}`
    };
  }

  async callContractSafe<T>(
    address: string,
    method: string,
    ...args: any[]
  ): Promise<{
    success: boolean;
    result?: T;
    error?: string;
    usedProvider?: string;
  }> {
    // 首先验证链ID
    const chainValidation = await this.validateChainId();
    if (!chainValidation.isValid) {
      return {
        success: false,
        error: chainValidation.error
      };
    }

    let lastError: Error | null = null;
    
    // 尝试所有provider
    for (let providerIndex = 0; providerIndex < this.providers.length; providerIndex++) {
      const provider = this.providers[providerIndex];
      const config = this.configs[providerIndex];
      
      // 对每个provider重试3次
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          if (attempt > 0) {
            const delay = this.getRetryDelay(attempt - 1);
            await this.delay(delay);
          }

          // 这里需要根据具体的合约调用来实现
          // 暂时返回成功，实际使用时需要传入合约实例
          this.currentProviderIndex = providerIndex;
          
          return {
            success: true,
            usedProvider: config.name
          };

        } catch (error: any) {
          lastError = error;
          
          const isRpcError = error.code === "UNKNOWN_ERROR" || 
                           error.message?.includes("Internal JSON-RPC error") ||
                           error.message?.includes("empty reader set");
          
          if (!isRpcError && attempt === 0) {
            break;
          }
        }
      }
    }

    return {
      success: false,
      error: `节点拥堵，请稍后重试。最后错误: ${lastError?.message || "未知错误"}`
    };
  }

  getCurrentProvider(): JsonRpcProvider {
    return this.providers[this.currentProviderIndex];
  }

  getCurrentProviderName(): string {
    return this.configs[this.currentProviderIndex].name;
  }
}

// 单例实例
export const rpcClient = new FallbackRpcClient();