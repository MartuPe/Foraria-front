import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { ensureChartJSRegistered } from "./chart.config";

ensureChartJSRegistered();

export type DonutDatum = { label: string; value: number; color: string };

export default function DonutChart({
  data,
  size = 220,
  cutout = "68%",
  showLegend = false,
}: {
  data: DonutDatum[];
  size?: number | string;
  cutout?: string | number;
  showLegend?: boolean;
}) {
  const cfg = useMemo(() => {
    return {
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            backgroundColor: data.map((d) => d.color),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout,
        plugins: {
          legend: { display: showLegend, position: "bottom" as const },
          tooltip: { callbacks: { label: (ctx: any) => `${ctx.label}: ${ctx.parsed}%` } },
        },
      },
      style: { width: size, height: size },
    };
  }, [data, cutout, size, showLegend]);

  return (
    <div style={cfg.style}>
      <Doughnut data={cfg.data} options={cfg.options} />
    </div>
  );
}
