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
  Descriptions,
  Skeleton,
  Tabs,
  Space,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { getEllipsisTxt } from "../../helpers/formatters";
import Blockie from "../Blockie";
import React, { useState, useEffect } from "react";
import Address from "../Address/Address";
import SkeletonAvatar from "antd/lib/skeleton/Avatar";
import WalletDescriptions from "./WalletDescriptions";
import AdoptionHistory from "./AdoptionHistory";
import Approval from "./Approval";

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

const { TabPane } = Tabs;

export default function UserProfile(props) {
  const { data, error, isLoading } = useMoralisQuery("User");
  const { account, isAuthenticated, user, setUserData } = useMoralis();
  const [address, setAddress] = useState();
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    setAddress(props?.address || (isAuthenticated && account));
    setUsername(
      isAuthenticated && account && user
        ? user.get("username")
        : "Please login first!"
    );
  }, [account, isAuthenticated, user, props]);

  const checkName = async (query) => {
    query.equalTo("username", newUsername);
  };

  const updateUsername = () => {
    setUserData({ username: newUsername });
    setUsername(newUsername);
  };

  const editOptions = {
    onChange: setNewUsername,
    onCancel: () => setNewUsername(""),
    tooltip: "Change username",
    maxLength: 15,
    autoSize: { maxRows: 1, minRows: 1 },
  };

  return (
    <Card className="centered-container-medium">
      <Title level={2} style={{ fontFamily: "Fredoka One" }}>
        Profile
      </Title>
      <Divider />
      {isAuthenticated && address ? (
        <>
          <div className="user-det-container">
            <Space direction="vertical">
              <Blockie
                currentWallet
                className="user-avatar"
                address={props?.account || address}
                size={28.5}
                skelSize={120}
              />
              <Text editable={editOptions} style={{ fontSize: "20px" }}>
                {username}
              </Text>
              <Paragraph
                style={{
                  border: "2px solid #777777",
                  borderRadius: "15px",
                  maxWidth: "fit-content",
                  padding: "2px 9px",
                  margin: "auto",
                }}
                copyable
              >
                {getEllipsisTxt(props.account || address, props.size)}
              </Paragraph>
            </Space>
          </div>
          <Divider style={{ marginBottom: "3px" }} />
          <div className="tab">
            <Tabs defaultActiveKey="1" centered>
              <TabPane tab="Wallet" key="1">
                <WalletDescriptions {...props} />
              </TabPane>
              <TabPane tab="Adoption" key="2">
                <AdoptionHistory {...props} />
              </TabPane>
              {props.owner && address.toLowerCase() == props.owner && (
                <TabPane tab="Pending Approval" key="3">
                  <Approval {...props} />
                </TabPane>
              )}
            </Tabs>
          </div>
        </>
      ) : (
        <div className="user-det-container">
          <Paragraph>Please connect to wallet first!</Paragraph>
          <Blockie
            className="user-avatar"
            address={address}
            size={28.5}
            skelSize={120}
          />
          <Skeleton
            paragraph={{ rows: 4 }}
            style={{
              padding: "2px 9px",
              margin: "auto",
            }}
            copyable
          >
            {getEllipsisTxt(address, props.size)}
          </Skeleton>
        </div>
      )}
    </Card>
  );
}
