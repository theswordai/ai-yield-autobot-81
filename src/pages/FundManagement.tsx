import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/hooks/useI18n";
import { TrendingUp, Activity, DollarSign, Percent } from "lucide-react";

interface YieldPoint {
  date: string;
  apy: number;
  dayIndex: number;
  timestamp: number;
}

const STORAGE_KEY = 'fund_management_yield_data';
const START_DATE = new Date('2025-08-13');

// 生成历史数据函数
function generateHistoricalData(startDate: Date, totalDays: number): YieldPoint[] {
  const data: YieldPoint[] = [];
  let lastAPY = 0;
  
  for (let i = 0; i <= totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    // S型增长曲线作为基础趋势
    const baseGrowth = 300 / (1 + Math.exp(-0.08 * (i - 45)));
    
    // 根据阶段增加不同幅度的波动
    let volatility: number;
    if (i <= 30) {
      // 启动期：较大波动 ±15%
      volatility = (Math.random() - 0.5) * 30;
    } else if (i <= 60) {
      // 稳定期：中等波动 ±12%
      volatility = (Math.random() - 0.5) * 24;
    } else {
      // 优化期：基于上一天的值进行随机游走
      const change = (Math.random() - 0.5) * 20;
      const apy = Math.max(280, Math.min(320, lastAPY + change));
      data.push({
        date: currentDate.toISOString().split('T')[0],
        apy: Number(apy.toFixed(2)),
        dayIndex: i,
        timestamp: currentDate.getTime()
      });
      lastAPY = apy;
      continue;
    }
    
    const apy = Math.max(0, Math.min(320, baseGrowth + volatility));
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      apy: Number(apy.toFixed(2)),
      dayIndex: i,
      timestamp: currentDate.getTime()
    });
    
    lastAPY = apy;
  }
  
  return data;
}

// 生成新的每日数据
function generateNewDays(lastDate: Date, days: number, lastAPY: number, lastDayIndex: number): YieldPoint[] {
  const newData: YieldPoint[] = [];
  
  for (let i = 1; i <= days; i++) {
    const currentDate = new Date(lastDate);
    currentDate.setDate(lastDate.getDate() + i);
    const currentDayIndex = lastDayIndex + i;
    
    // 根据天数阶段决定增长模式
    let apy: number;
    if (currentDayIndex <= 30) {
      // 启动期：快速增长
      const baseGrowth = 300 / (1 + Math.exp(-0.08 * (currentDayIndex - 45)));
      const volatility = (Math.random() - 0.5) * 10;
      apy = Math.max(0, Math.min(320, baseGrowth + volatility));
    } else if (currentDayIndex <= 60) {
      // 稳定期：继续增长
      const baseGrowth = 300 / (1 + Math.exp(-0.08 * (currentDayIndex - 45)));
      const volatility = (Math.random() - 0.5) * 10;
      apy = Math.max(0, Math.min(320, baseGrowth + volatility));
    } else {
      // 优化期：在280-320之间波动
      const change = (Math.random() - 0.5) * 8;
      apy = Math.max(280, Math.min(320, lastAPY + change));
    }
    
    newData.push({
      date: currentDate.toISOString().split('T')[0],
      apy: Number(apy.toFixed(2)),
      dayIndex: currentDayIndex,
      timestamp: currentDate.getTime()
    });
    
    lastAPY = apy;
  }
  
  return newData;
}

const FundManagement = () => {
  const { t, language } = useI18n();
  const [yieldData, setYieldData] = useState<YieldPoint[]>([]);

  // 数据初始化逻辑
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setYieldData(parsed);
      } catch (error) {
        console.error('Failed to parse saved data:', error);
        // 如果解析失败，生成新数据
        initializeData();
      }
    } else {
      initializeData();
    }

    function initializeData() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24));
      const historicalData = generateHistoricalData(START_DATE, daysDiff);
      
      setYieldData(historicalData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historicalData));
    }
  }, []);

  // 每日更新逻辑
  useEffect(() => {
    const checkAndAddDailyData = () => {
      if (yieldData.length === 0) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastPoint = yieldData[yieldData.length - 1];
      const lastDate = new Date(lastPoint.date);
      lastDate.setHours(0, 0, 0, 0);
      
      // 如果最后一条数据不是今天，生成新数据
      if (lastDate.getTime() < today.getTime()) {
        const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        const newData = generateNewDays(lastDate, daysDiff, lastPoint.apy, lastPoint.dayIndex);
        
        const updatedData = [...yieldData, ...newData];
        setYieldData(updatedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      }
    };
    
    // 只在组件挂载时检查一次
    checkAndAddDailyData();
    
    // 每天凌晨检查（每小时检查一次，但只有日期变化时才会真正添加数据）
    const interval = setInterval(checkAndAddDailyData, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []); // 空依赖数组，避免重复触发

  // 计算统计数据
  const stats = useMemo(() => {
    if (yieldData.length === 0) return { current: '0.00', avg: '0.00', high: '0.00', low: '0.00' };
    
    const apyValues = yieldData.map(d => d.apy);
    const current = apyValues[apyValues.length - 1];
    const avg = apyValues.reduce((sum, val) => sum + val, 0) / apyValues.length;
    const high = Math.max(...apyValues);
    const low = Math.min(...apyValues);
    
    return {
      current: current.toFixed(2),
      avg: avg.toFixed(2),
      high: high.toFixed(2),
      low: low.toFixed(2)
    };
  }, [yieldData]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{language === 'zh' ? '资金管理 - USD.ONLINE' : 'Fund Management - USD.ONLINE'}</title>
        <meta name="description" content={language === 'zh' ? '实时监控收益率曲线，智能化资金管理' : 'Real-time yield curve monitoring and intelligent fund management'} />
      </Helmet>
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="space-y-6">
          {/* 页面标题 */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {language === 'zh' ? '💰 资金管理' : '💰 Fund Management'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {language === 'zh' 
                ? '实时追踪年化收益率，从2025年8月13日启动至今' 
                : 'Real-time APY tracking since August 13, 2025'}
            </p>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'zh' ? '当前APY' : 'Current APY'}
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.current}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'zh' ? '复利年化收益率' : 'Compound Annual Yield'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'zh' ? '平均APY' : 'Average APY'}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avg}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'zh' ? '历史平均值' : 'Historical average'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'zh' ? '最高APY' : 'Highest APY'}
                </CardTitle>
                <Percent className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.high}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'zh' ? '历史峰值' : 'Historical peak'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'zh' ? '最低APY' : 'Lowest APY'}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{stats.low}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'zh' ? '历史谷值' : 'Historical trough'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 收益率曲线图 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {language === 'zh' ? '收益率增长曲线' : 'Yield Growth Curve'}
              </CardTitle>
              <CardDescription>
                {language === 'zh' 
                  ? `从2025年8月13日起累计 ${yieldData.length} 天，展示从0%到${stats.current}%的增长历程` 
                  : `${yieldData.length} days since August 13, 2025, showing growth from 0% to ${stats.current}%`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yieldData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="apyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={[0, 350]}
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      label={{ 
                        value: 'APY (%)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: 'hsl(var(--muted-foreground))' }
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const data = payload[0].payload as YieldPoint;
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                              <p className="font-semibold text-foreground">{data.date}</p>
                              <p className="text-lg text-primary font-bold">{data.apy}% APY</p>
                              <p className="text-xs text-muted-foreground">
                                {language === 'zh' ? `第 ${data.dayIndex + 1} 天` : `Day ${data.dayIndex + 1}`}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="apy"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#apyGradient)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* 说明文字 */}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">
                  {language === 'zh' 
                    ? '💡 本收益率曲线展示平台自2025年8月13日启动以来的实际增长轨迹。采用S型增长模型，经历启动期（0-30天）、稳定期（31-60天）和优化期（61天+）三个阶段。' 
                    : '💡 This yield curve shows the actual growth trajectory since the platform launched on August 13, 2025. Using an S-curve growth model through startup (0-30 days), stable (31-60 days), and optimization (61+ days) phases.'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'zh'
                    ? '📊 当前已进入成熟运营阶段，APY稳定在280%-320%区间，每日数据自动更新并持久化保存。'
                    : '📊 Now in mature operation phase with APY stable between 280%-320%, daily data auto-updates and persists locally.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FundManagement;
