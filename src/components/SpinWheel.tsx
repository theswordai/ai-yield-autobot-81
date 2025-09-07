import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SpinWheelProps {
  onSpin: () => Promise<void>;
  disabled: boolean;
  loading: boolean;
  canSpin: boolean;
  statusText?: string;
}

const WHEEL_SEGMENTS = [
  { value: 1, color: "from-red-400 to-red-600" },
  { value: 5, color: "from-blue-400 to-blue-600" },
  { value: 10, color: "from-green-400 to-green-600" },
  { value: 20, color: "from-yellow-400 to-yellow-600" },
  { value: 50, color: "from-purple-400 to-purple-600" },
  { value: 100, color: "from-pink-400 to-pink-600" },
  { value: 2, color: "from-cyan-400 to-cyan-600" },
  { value: 8, color: "from-orange-400 to-orange-600" },
];

export function SpinWheel({ onSpin, disabled, loading, canSpin, statusText }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  const handleSpin = async () => {
    if (disabled || loading || !canSpin) return;

    setIsSpinning(true);
    setResult(null);

    // 模拟转盘旋转
    const spins = 5 + Math.random() * 5; // 5-10 圈
    const finalAngle = Math.random() * 360;
    const totalRotation = rotation + spins * 360 + finalAngle;
    
    setRotation(totalRotation);

    // 等待动画完成后调用实际的抽奖函数
    setTimeout(async () => {
      try {
        await onSpin();
        // 模拟结果显示（实际结果会从链上获取）
        const randomResult = WHEEL_SEGMENTS[Math.floor(Math.random() * WHEEL_SEGMENTS.length)].value;
        setResult(randomResult);
      } catch (error) {
        console.error("Spin failed:", error);
      } finally {
        setIsSpinning(false);
      }
    }, 3000);
  };

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => setResult(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* 转盘容器 */}
      <div className="relative w-64 h-64">
        {/* 转盘背景 */}
        <div 
          className="w-full h-full rounded-full border-4 border-border relative overflow-hidden transition-transform duration-3000 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {WHEEL_SEGMENTS.map((segment, index) => {
            const angle = (360 / WHEEL_SEGMENTS.length) * index;
            const nextAngle = (360 / WHEEL_SEGMENTS.length) * (index + 1);
            
            return (
              <div
                key={index}
                className={`absolute w-full h-full bg-gradient-to-r ${segment.color}`}
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 45 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 45 * Math.sin((angle - 90) * Math.PI / 180)}%, ${50 + 45 * Math.cos((nextAngle - 90) * Math.PI / 180)}% ${50 + 45 * Math.sin((nextAngle - 90) * Math.PI / 180)}%)`,
                }}
              >
                <div 
                  className="absolute text-white font-bold text-sm"
                  style={{
                    top: '30%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${angle + (360 / WHEEL_SEGMENTS.length) / 2}deg)`,
                  }}
                >
                  {segment.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* 中心圆 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-foreground rounded-full border-2 border-background z-10" />

        {/* 指针 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-foreground z-20" 
             style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      </div>

      {/* 结果显示 */}
      {result && (
        <div className="animate-scale-in bg-primary text-primary-foreground px-6 py-3 rounded-lg text-xl font-bold">
          🎉 恭喜获得 {result} USDV!
        </div>
      )}

      {/* 状态文本 */}
      {!canSpin && statusText && (
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded text-center">
          {statusText}
        </div>
      )}

      {/* 抽奖按钮 */}
      <Button
        onClick={handleSpin}
        disabled={disabled || loading || !canSpin || isSpinning}
        className="w-32 h-12 text-lg font-semibold"
        size="lg"
      >
        {(loading || isSpinning) && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
        {isSpinning ? "抽奖中..." : canSpin ? "开始抽奖" : "暂不可用"}
      </Button>
    </div>
  );
}