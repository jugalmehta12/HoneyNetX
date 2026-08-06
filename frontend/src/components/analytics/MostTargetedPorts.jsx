import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const riskColors = {
  Critical: "#EF4444",
  High: "#F59E0B",
  Medium: "#3B82F6",
  Low: "#64748B",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Port {data.port}
          </span>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: `${riskColors[data.risk]}20`,
              color: riskColors[data.risk],
            }}
          >
            {data.risk}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {data.protocol} — {data.count} attacks
        </p>
      </div>
    );
  }
  return null;
};

function MostTargetedPorts({ data }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Most Targeted Ports</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Ports with highest attack volume
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="port"
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-muted)" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={28}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={riskColors[entry.risk]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MostTargetedPorts;
