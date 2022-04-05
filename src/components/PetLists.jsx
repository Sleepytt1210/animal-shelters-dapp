import { List, Card } from "antd";

const { Meta } = Card;

export default function PetList({ dataSource }) {
  return (
    <List
      grid={{ gutter: 16, column: 4 }}
      dataSource={dataSource}
      split={false}
      renderItem={(item) => (
        <List.Item key={item.petID}>
          <Card
            hoverable
            cover={item.img}
            style={{ padding: "12px 12px 0" }}
            bodyStyle={{ padding: "12px 24px" }}
          >
            <Meta title={item.name} description={item.breed}></Meta>
          </Card>
        </List.Item>
      )}
    />
  );
}
