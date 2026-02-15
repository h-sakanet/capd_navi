export class AlarmPlayer {
    private ctx: AudioContext | null = null;
    private oscillator: OscillatorNode | null = null;
    private gainNode: GainNode | null = null;
    private isPlaying = false;
    private timerId: number | null = null;

    private getContext(): AudioContext {
        if (!this.ctx) {
            // @ts-ignore - Handle webkit prefix if needed, though standard is well supported now
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        return this.ctx;
    }

    // ユーザーインタラクション時に呼び出して AudioContext を resume する必要がある
    public async unlock(): Promise<void> {
        const ctx = this.getContext();
        if (ctx.state === "suspended") {
            await ctx.resume();
        }
    }

    public play() {
        if (this.isPlaying) return;
        this.isPlaying = true;

        const ctx = this.getContext();

        // シンプルなパターン再生: ピッ、ピッ、ピッ... (500ms ON, 500ms OFF)
        const playBeep = () => {
            if (!this.isPlaying) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5

            // 音量エンベロープ: アタックとリリース
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2); // 200ms duration

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        };

        playBeep();
        this.timerId = window.setInterval(playBeep, 1000); // 1秒間隔
    }

    public stop() {
        this.isPlaying = false;
        if (this.timerId) {
            window.clearInterval(this.timerId);
            this.timerId = null;
        }
    }
}

export const alarmPlayer = new AlarmPlayer();
