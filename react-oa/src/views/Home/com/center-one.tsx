import ReactECharts from "echarts-for-react";
import type { DashboardTrend } from "@/api/dashboard";

interface TrendChartProps {
  trends: DashboardTrend[];
}

function buildOption(trends: DashboardTrend[]) {
  return {
    title: {
      text: "近7日订单情况",
    },
    grid: {
      top: "20%",
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: trends.map((item) => item.label),
        axisTick: {
          show: false,
        },
        name: "日期",
        nameLocation: "start",
        nameTextStyle: {
          verticalAlign: "top",
          padding: [10, 0, 0, 0],
        },
        nameGap: 20,
        max: 6,
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "订单数",
        nameTextStyle: {
          align: "right",
          lineHeight: 30,
        },
      },
    ],
    series: [
      {
        name: "订单数",
        type: "bar",
        barWidth: "30%",
        label: {
          show: true,
          position: "top",
          fontWeight: "bold",
          lineHeight: 30,
        },
        data: trends.map((item) => item.orders),
        itemStyle: {
          borderRadius: [15, 15, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "#0b74fe",
              },
              {
                offset: 1,
                color: "white",
              },
            ],
          },
        },
      },
    ],
  };
}

const One: React.FC<TrendChartProps> = ({ trends }) => {
  return (
    <ReactECharts
      option={buildOption(trends)}
      style={{ height: 400 }}
      opts={{ renderer: "svg" }}
    />
  );
};

export default One;
