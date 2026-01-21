import Paper from "@mui/material/Paper";
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  BarSeries,
} from "@devexpress/dx-react-chart-material-ui";

export default function CategoryChart({ data }) {
  if (!data || data.length === 0) {
    return <p>No category data available</p>;
  }

  return (
    <Paper>
      <Chart data={data}>
        <ArgumentAxis />
        <ValueAxis />
        <BarSeries
          valueField="total"
          argumentField="label"
        />
      </Chart>
    </Paper>
  );
}
