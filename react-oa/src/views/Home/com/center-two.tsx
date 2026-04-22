import ReactECharts from "echarts-for-react";

const option = {
  grid: {
    top: "20%",
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  title: {
    text: "近7日充值趋势",
  },
  xAxis: {
    type: "category",
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
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
      data: [20600, 21000, 59600, 21000, 78000, 30000, 21000],
      type: "line",
      smooth: true,
      symbol: "none",
      lineStyle: {
        // 线条样式
        color: "#fea251", // 设置线条颜色为红色
        width: 5, // 设置线条宽度为2px
      },
    },
  ],
};

const Two: React.FC = () => {
  return (
    <ReactECharts
      option={option}
      style={{ height: 400 }}
      opts={{ renderer: "svg" }}
    />
  );
};

export default Two;
