import React, { useState } from "react";
import { Row, Col, Typography, Radio } from "antd";
import Transaction from "./Transaction";
import PetStats from "./Pets";

const { Title } = Typography;

export default function Statistics(props) {
  const [isTransactionPage, setIsTransactionPage] = useState(true);
  const onChange = (e) => {
    setIsTransactionPage(e.target.value);
  };

  return (
    <div className="spaced-container">
      <Row>
        <Col span={20}>
          <Title>Statistics</Title>
        </Col>
        <Col span={4} className="stat-options">
          <div style={{ display: "inline", marginRight: "1rem" }}>
            Switch to:
          </div>
          <Radio.Group onChange={onChange} defaultValue={isTransactionPage}>
            <Radio.Button value={true}>Transactions</Radio.Button>
            <Radio.Button data-testid="pRadio" value={false}>
              Pets
            </Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
      {isTransactionPage ? <Transaction {...props} /> : <PetStats {...props} />}
    </div>
  );
}
