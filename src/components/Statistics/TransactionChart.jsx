import React from "react";
import { Column } from "@ant-design/charts";
import mockDonation from "../../utils/mockDonation.json";

const TransactionChart = () => {
  const config = {
    data: mockDonation,
    isStack: true,
    xField: "date",
    yField: "value",
    seriesField: "txType",
    label: {
      position: "middle",
    },
    scrollbar: {
      type: "horizontal",
      categorySize: 100,
    },
  };

  return (
    <div>
      <Column {...config} />
    </div>
  );
};
export default TransactionChart;
