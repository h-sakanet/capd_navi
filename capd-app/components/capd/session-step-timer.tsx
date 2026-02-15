"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff } from "@mynaui/icons-react";
import { Button } from "@/components/ui/button";
import { alarmPlayer } from "@/lib/utils/audio";
import { cn } from "@/lib/utils";

interface SessionStepTimerProps {
    startedAtMs: number;
    durationMinutes: number;
    onAcknowledge?: () => void;
    className?: string;
}

export function SessionStepTimer({
    startedAtMs,
    durationMinutes,
    onAcknowledge,
    className
}: SessionStepTimerProps) {
    const [elapsedMs, setElapsedMs] = useState(0);
    const [isAlarmActive, setIsAlarmActive] = useState(false);
    const audioUnlockedRef = useRef(false);

    const durationMs = durationMinutes * 60 * 1000;
    const remainingMs = Math.max(0, durationMs - elapsedMs);
    const isOvertime = elapsedMs >= durationMs;

    // タイマー更新
    useEffect(() => {
        // 初回マウント時に現在時刻との差分を計算
        const update = () => {
            const now = Date.now();
            // 未来の日付が渡された場合などに負にならないようにガード
            const diff = Math.max(0, now - startedAtMs);
            setElapsedMs(diff);

            // アラーム発動条件: 時間経過 かつ まだ停止していない
            // ただし、既に onAcknowledge されていれば親コンポーネントがこのコンポーネントを
            // 「確認済みモード」で表示するか非表示にするはずなので、ここでは単純に時間経過で鳴らす
            if (diff >= durationMs && !isAlarmActive) {
                setIsAlarmActive(true);
            }
        };

        update();
        const intervalId = window.setInterval(update, 1000);
        return () => window.clearInterval(intervalId);
    }, [startedAtMs, durationMs, isAlarmActive]);

    // アラーム再生制御
    useEffect(() => {
        if (isOvertime) {
            // ユーザーインタラクションなしで再生しようとするとブロックされる可能性があるが試みる
            // 実際には「次へ」ボタンなどを押した時点で unlock しておくのがベスト
            if (!audioUnlockedRef.current) {
                alarmPlayer.unlock().then(() => {
                    audioUnlockedRef.current = true;
                }).catch(() => {
                    console.warn("AudioContext unlock failed - waiting for interaction");
                });
            }

            alarmPlayer.play();

            // バイブレーション (モバイル用)
            if (typeof navigator !== "undefined" && navigator.vibrate) {
                // 1秒振動、0.5秒停止、1秒振動...
                const vibeInterval = window.setInterval(() => {
                    navigator.vibrate(1000);
                }, 1500);
                return () => {
                    alarmPlayer.stop();
                    window.clearInterval(vibeInterval);
                    navigator.vibrate(0); // 停止
                };
            }

            return () => {
                alarmPlayer.stop();
            };
        }
    }, [isOvertime]);

    // クリーンアップ
    useEffect(() => {
        return () => alarmPlayer.stop();
    }, []);

    const handleStopAlarm = () => {
        alarmPlayer.stop();
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(0);
        }
        onAcknowledge?.();
    };

    // 時間表示フォーマット
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className={cn("flex flex-col items-center justify-center space-y-4 rounded-xl border p-6 text-center shadow-sm transition-colors",
            isOvertime ? "border-red-500 bg-red-50" : "border-blue-200 bg-blue-50",
            className
        )}>
            <div className="space-y-1">
                <h3 className={cn("text-sm font-medium", isOvertime ? "text-red-600" : "text-blue-600")}>
                    {isOvertime ? "設定時間経過" : "残り時間"}
                </h3>
                <div className={cn("text-5xl font-bold tracking-tighter tabular-nums", isOvertime ? "text-red-600 animate-pulse" : "text-blue-900")}>
                    {isOvertime ? formatTime(elapsedMs - durationMs) : formatTime(remainingMs)}
                </div>
                <p className="text-xs text-muted-foreground">
                    {isOvertime ? "経過時間" : `設定時間: ${durationMinutes}分`}
                </p>
            </div>

            {isOvertime && (
                <div className="w-full pt-2">
                    <Button
                        size="lg"
                        variant="destructive"
                        className="w-full gap-2 text-lg font-bold"
                        onClick={handleStopAlarm}
                    >
                        <BellOff className="h-6 w-6" />
                        アラームを止める
                    </Button>
                </div>
            )}

            {!isOvertime && (
                <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
                    <Bell className="h-4 w-4" />
                    <span>{durationMinutes}分後にアラームが鳴ります</span>
                </div>
            )}
        </div>
    );
}
