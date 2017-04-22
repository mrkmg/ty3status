import {clearTimeout, setImmediate, setTimeout} from "timers";

export default class ActionLimiter {
    private delayTimer: NodeJS.Timer;
    private isWaiting: boolean = false;
    private runAfterWait: boolean = false;

    constructor(private action: () => void, private delay: number) {
    };

    public run(): void {
        if (this.isWaiting) {
            this.runAfterWait = true;
            return;
        }

        this.isWaiting = true;

        this.delayTimer = setTimeout(() => this.delayTimerFinished(), this.delay);

        setImmediate(this.action);
    }

    public reset(): void {
        this.isWaiting = false;
        this.runAfterWait = false;
        clearTimeout(this.delayTimer);
    }

    private delayTimerFinished() {
        this.isWaiting = false;
        if (this.runAfterWait) {
            this.runAfterWait = false;
            this.run();
        }
    }
}
