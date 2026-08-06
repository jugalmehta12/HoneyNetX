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

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">{data.country}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {data.attacks} attacks ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarShape = (props) => {
  const { x, y, width, height, index } = props;
  const colors = ["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#64748B"];

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={colors[index % colors.length]}
      rx={4}
      ry={4}
    />
  );
};

function TopCountriesChart({ data }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Top Attacking Countries</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Geographic distribution of attacks
        </p>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
            />
            <YAxis
              dataKey="country"
              type="category"
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
              width={75}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-muted)" }} />
            <Bar
              dataKey="attacks"
              shape={<CustomBarShape />}
              barSize={20}
              radius={[0, 4, 4, 0]}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TopCountriesChart;
