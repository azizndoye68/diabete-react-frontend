import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function GlycemieChart({ data }) {
  // Transformation de la date si nécessaire
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.dateSuivi).toLocaleDateString('fr-FR'),
    glycemie: parseFloat(item.glycemie),
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 'auto']} unit=" g/L" />
        <Tooltip />
        <Line type="monotone" dataKey="glycemie" stroke="#28a745" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default GlycemieChart;
