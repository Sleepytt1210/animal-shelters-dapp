import React from "react";
import {
  Row,
  Col,
  Table,
  Card,
  Statistic,
  Button,
  Divider,
  Tooltip,
} from "antd";
import { useGetDonation } from "../../hooks/useGetDonation";
import mockDonation from "../../utils/mockDonation.json";
import { tokenValue } from "../../helpers/formatters";
import TransactionChart from "./TransactionChart";
import { SyncOutlined } from "@ant-design/icons";

const mockColumns = [
  {
    title: "Date",
    dataIndex: "date",
    key: "txDate",
    defaultSortOrder: "descend",
    sorter: (a, b) => {
      return a.date - b.date;
    },
  },
  {
    title: "Value",
    dataIndex: "value",
    key: "value",
  },
  {
    title: "Token Type",
    dataIndex: "txType",
    key: "txType",
  },
];

export default function Transaction(props) {
  const { totalETHDonation, totalSNOWDonation, getTotalDonation } =
    useGetDonation(props);
  const owner = props.owner;

  return (
    <>
      <Card className="round-card" style={{ minHeight: "100px" }}>
        <Row gutter={36}>
          <Col span={6} className="stats">
            <Statistic
              title="Total SNOW Donation"
              value={tokenValue(totalSNOWDonation, 9)}
            />
          </Col>
          <Col span={6} className="stats">
            <Statistic
              title="Total ETH Donation"
              value={tokenValue(totalETHDonation, 18)}
            />
          </Col>
          <Col span={6} className="stats">
            <Statistic
              title="SNOW Price in USD"
              value={0.0451}
              precision={4}
              prefix={"$"}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Total SNOW Donation Today"
              value={tokenValue(totalSNOWDonation, 9)}
            />
          </Col>
        </Row>
      </Card>
      <Card
        title="Annual Donation by Token Type"
        className="round-card"
        headStyle={{
          borderBottom: "0",
          fontSize: "24px",
          fontWeight: "600",
          fontFamily: "Nunito",
        }}
        style={{ minHeight: "400px" }}
      >
        <div id="container">
          <TransactionChart />
        </div>
      </Card>
      <Card
        title="Transactions History of Shelter Wallet"
        className="round-card"
        headStyle={{
          borderBottom: "0",
          fontSize: "24px",
          fontWeight: "600",
          fontFamily: "Nunito",
        }}
        style={{ minHeight: "100px" }}
        extra={
          <Tooltip title="Reload the data">
            <Button
              shape="circle"
              icon={<SyncOutlined />}
              onClick={getTotalDonation}
              style={{ marginBottom: "16px" }}
            />
          </Tooltip>
        }
      >
        <Table
          dataSource={mockDonation}
          columns={mockColumns}
          rowKey="Id"
        ></Table>
      </Card>
      <Divider>Owner's Address</Divider>
      <Button block style={{ background: "#fff", border: "1px solid black" }}>
        {owner}
      </Button>
    </>
  );
}
