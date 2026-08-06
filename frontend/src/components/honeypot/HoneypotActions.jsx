import { Play, Square, RotateCcw, Settings, FileText } from "lucide-react";

function HoneypotActions({ status, onAction }) {
  const isRunning = status === "Running";
  const isStopped = status === "Stopped";

  return (
    <div className="flex items-center gap-1">
      {isStopped && (
        <button
          onClick={() => onAction("start")}
          className="rounded-md p-1.5 text-success hover:bg-success/10"
          aria-label="Start honeypot"
          title="Start"
        >
          <Play className="size-4" />
        </button>
      )}
      {isRunning && (
        <button
          onClick={() => onAction("stop")}
          className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
          aria-label="Stop honeypot"
          title="Stop"
        >
          <Square className="size-4" />
        </button>
      )}
      {isRunning && (
        <button
          onClick={() => onAction("restart")}
          className="rounded-md p-1.5 text-warning hover:bg-warning/10"
          aria-label="Restart honeypot"
          title="Restart"
        >
          <RotateCcw className="size-4" />
        </button>
      )}
      <button
        onClick={() => onAction("configure")}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Configure"
        title="Configure"
      >
        <Settings className="size-4" />
      </button>
      <button
        onClick={() => onAction("logs")}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="View logs"
        title="View Logs"
      >
        <FileText className="size-4" />
      </button>
    </div>
  );
}

export default HoneypotActions;
