import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: data.payload.color }}
          />
          <span className="font-medium text-foreground">{data.name}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {data.value} attacks
        </p>
      </div>
    );
  }
  return null;
};

function ProtocolDistribution({ data }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Protocol Distribution</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Attacks by network protocol
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              strokeWidth={2}
              stroke="var(--color-card)"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ fontSize: 11, paddingLeft: 20 }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ProtocolDistribution;
