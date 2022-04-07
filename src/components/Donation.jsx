import {
  Form,
  Row,
  message,
  Input,
  Button,
  Select,
  Card,
  Divider,
  Typography,
  InputNumber,
} from "antd";
import React from "react";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const currency = (
  <Form.Item name="currency" initialValue="SNOW" noStyle>
    <Select style={{ width: "auto" }}>
      <Option value="SNOW">SNOW</Option>
      <Option value="ETH">ETH</Option>
    </Select>
  </Form.Item>
);

const onFinish = (values, form) => {
  message.success("Submit success!");
  console.log(form.fields);
  console.log(values);
};

export default function Donation() {
  const [form] = Form.useForm();
  return (
    <Card className="centered-container-small">
      <Form
        form={form}
        autoComplete="off"
        onFinish={(values) => onFinish(values, form)}
      >
        <Title level={2} style={{ fontFamily: "Fredoka One" }}>
          Donation
        </Title>
        <Divider />
        <Card className="announcement-wrapper">
          <Paragraph id="announcement">
            Welcome to the donation page, donations are accepted in SNOW and
            ETH. You can feel free to add an optional short message upon
            donation. The donation means a lot to us, even just a small amount.
            Thank you for reading!
          </Paragraph>
        </Card>
        <Form.Item
          name="amount"
          label="Amount"
          labelCol={{ span: 24 }}
          rules={[
            { required: true, message: "Please input donation amount!" },
            {
              type: "number",
              min: 100,
              max: 1000000000,
              message: "Amount must between 100 to 1000000000",
            },
          ]}
        >
          <InputNumber
            min={0}
            max={1000000000}
            addonBefore={currency}
            placeholder="1337"
          />
        </Form.Item>
        <Form.Item name="message" label="Message" labelCol={{ span: 24 }}>
          <Input
            placeholder="Short message about this donation."
            maxLength={50}
            showCount
          />
        </Form.Item>
        <Divider />
        <Form.Item style={{ textAlign: "center", marginBottom: "0" }}>
          <Button type="primary" htmlType="submit" size="large">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
