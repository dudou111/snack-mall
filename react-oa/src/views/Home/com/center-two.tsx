import ReactECharts from "echarts-for-react";
import type { DashboardTrend } from "@/api/dashboard";

interface TrendChartProps {
  trends: DashboardTrend[];
}

function buildOption(trends: DashboardTrend[]) {
  return {
    grid: {
      top: "20%",
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    title: {
      text: "近7日销售额趋势",
    },
    xAxis: {
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
    yAxis: {
      type: "value",
      name: "单位(元)",
      nameTextStyle: {
        align: "right",
        lineHeight: 30,
      },
    },
    series: [
      {
        data: trends.map((item) => item.amount),
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: {
          color: "#fea251",
          width: 5,
        },
        itemStyle: {
          color: "#fea251",
        },
      },
    ],
  };
}

const Two: React.FC<TrendChartProps> = ({ trends }) => {
  return (
    <ReactECharts
      option={buildOption(trends)}
      style={{ height: 400 }}
      opts={{ renderer: "svg" }}
    />
  );
};

export default Two;
