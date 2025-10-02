import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { ensureChartJSRegistered } from "./chart.config";

ensureChartJSRegistered();

export default function BarsChart({
  data,
  height = 180,
  color = "#2ecc71",
  label = "Serie",
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  label?: string;
}) {
  const cfg = useMemo(() => {
    return {
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label,
            data: data.map((d) => d.value),
            backgroundColor: color,
            borderRadius: 8,
            barThickness: 32,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, grid: { color: "rgba(0,0,0,.06)" } },
          x: { grid: { display: false } },
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => `${ctx.parsed.y}` } },
        },
      },
      style: { width: "100%", height },
    };
  }, [data, color, height, label]);

  return (
    <div style={cfg.style}>
      <Bar data={cfg.data} options={cfg.options} />
    </div>
  );
}
