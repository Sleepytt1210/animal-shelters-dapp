import { List, Card, Row } from "antd";
import React from "react";

const { Meta } = Card;

export default function PetList({ dataSource }) {
  const col = 4;
  const limit = 8;
  const n = dataSource.length;
  return (
    <Row style={{ minWidth: "100%", justifyContent: "center" }}>
      <List
        grid={{ gutter: 16, column: col }}
        dataSource={dataSource}
        split={false}
        pagination={n > 0 ? { pageSize: limit } : false}
        renderItem={(item) => (
          <List.Item key={item.petID}>
            <Card
              hoverable
              cover={React.cloneElement(item.img, { preview: false })}
              style={{ padding: "12px 12px 0", borderRadius: "5%" }}
              bodyStyle={{ padding: "15px 24px 20px" }}
              onClick={() => (window.location = `/adoptpet/${item.petID}`)}
            >
              <Meta
                title={item.name}
                description={item.breed}
                className="pet-meta-data"
              ></Meta>
            </Card>
          </List.Item>
        )}
      />
    </Row>
  );
}
