import { cn } from "@/lib/utils";

function SectionHeader({ title, description, action, className }) {
  return (
    <div className={cn("flex items-start justify-between", className)}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export default SectionHeader;
