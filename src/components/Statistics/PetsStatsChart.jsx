import React from "react";
import { Area } from "@ant-design/charts";

export default function PetsStatsChart({ data, isIntake }) {
  const config = {
    data,
    xField: "date",
    yField: isIntake ? "intake" : "outcome",
    color: ["#6897a7", "#8bc0d6", "#fab36f", "#d96d6f"],
    seriesField: "type",
    scrollbar: {
      type: "horizontal",
      categorySize: 100,
    },
  };

  return <Area {...config} />;
}
