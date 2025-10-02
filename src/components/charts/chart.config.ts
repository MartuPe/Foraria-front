import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

let registered = false;
export function ensureChartJSRegistered() {
  if (registered) return;
  ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);
  registered = true;
}
