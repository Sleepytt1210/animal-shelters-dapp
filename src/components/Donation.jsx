import {
  Form,
  message,
  Input,
  Button,
  Select,
  Card,
  Divider,
  Typography,
  InputNumber,
} from "antd";
import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { BN } from "../utils/util";
import { useDonate } from "../hooks/useDonate";
import SuccessModal from "./SuccessModal";

const { Title, Paragraph } = Typography;
const { Option } = Select;

const currency = (
  <Form.Item name="currency" initialValue="SNOW" noStyle>
    <Select style={{ width: "auto" }}>
      <Option value="SNOW">SNOW</Option>
      <Option value="ETH">ETH</Option>
    </Select>
  </Form.Item>
);

export default function Donation(props) {
  const [form] = Form.useForm();
  const { donate } = useDonate(props);
  const { chainId } = useMoralis();
  const [submitted, setSubmitted] = useState(false);
  const [txHash, setTxHash] = useState("");

  const resultProps = {
    visible: submitted,
    chainId: chainId,
    tx: txHash,
    width: "50%",
    title: "Thank you for your donation!",
    description:
      "We sincerely appreciate your donation! Your transaction has been recorded in the blockchain.",
  };

  const onFinish = async (values) => {
    const amount = BN(values.amount);
    console.log(amount, values);
    donate(amount, values.currency, values.message, (receipt) => {
      message.success("Submit success!");
      const tx =
        receipt.tx ||
        receipt?.transactionHash ||
        receipt.receipt?.transactionHash;
      setTxHash(tx);
      setSubmitted(true);
    });
  };

  return (
    <Card className="centered-container-small">
      <SuccessModal {...resultProps} />
      <Form form={form} onFinish={onFinish}>
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
              min: 0.001,
              max: 1000000000,
              message: "Amount must between 0.001 and 1000000000",
            },
          ]}
        >
          <InputNumber
            min={0}
            max={1000000000}
            step={0.001}
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
