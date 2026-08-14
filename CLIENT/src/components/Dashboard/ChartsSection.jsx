import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Test", value: 10 },
  { name: "Test2", value: 20 },
];

const ChartsSection = () => {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="text-sm font-medium mb-4">Test Chart</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartsSection;