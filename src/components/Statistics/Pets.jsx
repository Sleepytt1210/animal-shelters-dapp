import React, { useState, useCallback } from "react";
import { Row, Col, Table, Card, Statistic } from "antd";
import { useGetPetStats } from "../../hooks/useGetPetStats";
import PetsStatsChart from "./PetsStatsChart";
import mockIntake from "../../utils/mockIntake";
import mockOutcome from "../../utils/mockOutcome";
import mockPetStats from "../../utils/mockPetStats.json";
import { stateToString } from "../../utils/util";
import { getEllipsisTxt } from "../../helpers/formatters";

export default function PetStats(props) {
  const { petCount, adoptionEvents } = useGetPetStats(props);
  const [totalOutcome, setTotalOutcome] = useState(0);
  const [totalAdopted, setTotalAdopted] = useState(0);

  const calculateTotalAdopted = useCallback(() => {
    const outcomeRecords = adoptionEvents.filter(
      (o) => o.returnValues.status == 4 || o.returnValues.status > 7
    );
    const adoptedRecords = outcomeRecords.filter(
      (o) => o.returnValues.status == 4
    );
    setTotalOutcome(outcomeRecords);
    setTotalAdopted(adoptedRecords);
  }, [adoptionEvents]);

  const mockColumns = [
    {
      title: "Transaction Hash",
      dataIndex: "tx",
      key: "tx",
      render: (tx) => getEllipsisTxt(tx, 10),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      defaultSortOrder: "descend",
      sorter: (a, b) => {
        return a.date - b.date;
      },
      render: (date) => new Date(Number(date)).toLocaleDateString("en-GB"),
    },
    {
      title: "Event",
      dataIndex: "event",
      key: "event",
      render: (state) => stateToString[state],
    },
    {
      title: "Adopter",
      dataIndex: "adopter",
      key: "adopter",
    },
    {
      title: "Pet ID",
      dataIndex: "petId",
      key: "petID",
    },
  ];

  return (
    <>
      <Card className="round-card" style={{ minHeight: "100px" }}>
        <Row gutter={36}>
          <Col span={6} className="stats">
            <Statistic title="Total Pet Intake" value={petCount} />
          </Col>
          <Col span={6} className="stats">
            <Statistic
              title="Total Transactions"
              value={adoptionEvents.length}
            />
          </Col>
          <Col span={6} className="stats">
            <Statistic title="Total Outcome" value={totalOutcome} />
          </Col>
          <Col span={6}>
            <Statistic title="Total Adopted" value={totalAdopted} />
          </Col>
        </Row>
      </Card>
      <Row gutter={20}>
        <Col span={12}>
          <Card
            title="Pet Intake"
            className="round-card"
            headStyle={{
              borderBottom: "0",
              fontSize: "24px",
              fontWeight: "600",
              fontFamily: "Nunito",
            }}
            style={{ minHeight: "350px" }}
          >
            <div id="container">
              <PetsStatsChart isIntake data={mockIntake} />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="Pet Outcome"
            className="round-card"
            headStyle={{
              borderBottom: "0",
              fontSize: "24px",
              fontWeight: "600",
              fontFamily: "Nunito",
            }}
            style={{ minHeight: "350px" }}
          >
            <div id="container">
              <PetsStatsChart data={mockOutcome} />
            </div>
          </Card>
        </Col>
      </Row>
      <Card className="round-card" style={{ minHeight: "100px" }}>
        <Table columns={mockColumns} dataSource={mockPetStats} />
      </Card>
    </>
  );
}
