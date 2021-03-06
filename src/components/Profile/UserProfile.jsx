import {
  message,
  Card,
  Divider,
  Typography,
  Skeleton,
  Tabs,
  Space,
} from "antd";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { getEllipsisTxt } from "../../helpers/formatters";
import Blockie from "../Blockie";
import React, { useState, useEffect } from "react";
import WalletDescriptions from "./WalletDescriptions";
import AdoptionHistory from "./AdoptionHistory";
import Approval from "./Approval";
import DonationHistory from "./DonationHistory";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export default function UserProfile(props) {
  const { account, isAuthenticated, user, logout, setUserData } = useMoralis();
  const [address, setAddress] = useState("");
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  useEffect(() => {
    if (isAuthenticated && address && account != address) {
      logout().then(() => {
        setAddress("");
        setUsername("");
        setNewUsername("");
        message.info("Account changed, please login again!", 5);
      });
    }
  }, [isAuthenticated, account, address, logout]);

  useEffect(() => {
    if (isAuthenticated && account) setAddress(account);
    setUsername(
      isAuthenticated && account && user
        ? user.get("username")
        : "Please login first!"
    );
  }, [account, isAuthenticated, user, props, isOwner]);

  useEffect(() => {
    if (props.owner.length > 0 && address.length > 0)
      setIsOwner(
        props.owner && address?.toLowerCase() == props.owner.toLowerCase()
      );
  }, [address, props.owner]);

  useEffect(() => {
    if (newUsername.length == 0 || newUsername === username) return;
    console.log("New username", newUsername);
    setUserData({ username: newUsername })
      .then(() => {
        setUsername(newUsername);
        message.success(`Successfully changed username to ${newUsername}!`);
        setNewUsername("");
      })
      .catch((error) => message.error(error));
  }, [newUsername, username, setUserData]);

  const editOptions = {
    onChange: setNewUsername,
    onCancel: () => setNewUsername(""),
    tooltip: "Change username",
    maxLength: 15,
    autoSize: { maxRows: 1 },
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
                address={address || props?.account}
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
              <TabPane tab="Donation" key="2">
                <DonationHistory {...props} />
              </TabPane>
              <TabPane tab="Adoption" key="3">
                <AdoptionHistory {...props} isOwner={isOwner} />
              </TabPane>
              {isOwner && (
                <TabPane tab="Pending Approval" key="4">
                  <Approval {...props} />
                </TabPane>
              )}
            </Tabs>
          </div>
        </>
      ) : (
        <div className="user-det-container">
          <Paragraph style={{ fontSize: 18 }}>
            Please connect to wallet first!
          </Paragraph>
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
