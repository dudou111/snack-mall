import ReactECharts from "echarts-for-react";

const option = {
  title: {
    text: "近7日购买情况",
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
  ],
  yAxis: [
    {
      type: "value",
      name: "购买人次",
      nameTextStyle: {
        align: "right",
        lineHeight: 30,
      },
    },
  ],
  series: [
    {
      name: "Direct",
      type: "bar",
      barWidth: "30%",
      label: {
        show: true,
        position: "top",
        fontWeight: "bold",
        lineHeight: 30,
      },
      data: [5600, 7600, 3600, 5000, 7800, 5600, 6200],
      itemStyle: {
        borderRadius: [15, 15, 0, 0], // 设置柱状图顶部为圆弧形状
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: "#0b74fe", // 渐变起始颜色为蓝色
            },
            {
              offset: 1,
              color: "white", // 渐变结束颜色为白色
            },
          ],
        },
      },
    },
  ],
};

const One: React.FC = () => {
  return (
    <ReactECharts
      option={option}
      style={{ height: 400 }}
      opts={{ renderer: "svg" }}
    />
  );
};

export default One;
