import React from "react";
import { Modal, Button, Result, Typography } from "antd";
import { getExplorer } from "../helpers/networks";

const { Paragraph } = Typography;

export default function SuccessModal({
  visible,
  chainId,
  tx,
  width,
  title,
  description,
  isForceBackHome,
  setModalVisible,
}) {
  return (
    <Modal
      visible={visible}
      footer={null}
      onCancel={() =>
        isForceBackHome ? (window.location = "/home") : setModalVisible(false)
      }
      bodyStyle={{
        textAlign: "center",
        fontFamily: "Nunito",
        padding: "15px",
        fontSize: "17px",
        fontWeight: "500",
      }}
      style={{ fontSize: "16px", fontWeight: "500" }}
      width={width}
    >
      <Result
        status="success"
        title={title}
        subTitle={
          <div>
            <Paragraph>{description}</Paragraph>
            <Paragraph>
              Transaction hash:{" "}
              {
                <a
                  href={`${getExplorer(chainId)}/tx/${tx}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {tx}
                </a>
              }
            </Paragraph>
          </div>
        }
        extra={[
          <Button
            type="primary"
            key="console"
            onClick={() => (window.location = "/profile")}
          >
            Check in Profile
          </Button>,
          <Button
            key="back"
            onClick={() =>
              isForceBackHome
                ? (window.location = "/home")
                : setModalVisible(false)
            }
          >
            {isForceBackHome ? "Back to Home" : "Close"}
          </Button>,
        ]}
      />
    </Modal>
  );
}
