import { Tooltip, Button, Table, message, Space } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useCallback } from "react";
import { useMoralis } from "react-moralis";
import { getEllipsisTxt } from "../../helpers/formatters";
import FormReview from "./FormReview";
import { useGetPetStats } from "../../hooks/useGetPetStats";

export default function Approval(props) {
  const { isAuthenticated, account } = useMoralis();
  const { adoptionEvents } = useGetPetStats(props);
  const [history, setHistory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [curTx, setCurTx] = useState({
    txHash: "none",
    adopter: "",
    petID: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkAdoptionContract = () => {
    if (!props.contracts.adoption) {
      message.error("Adoption Contract is not loaded!");
      return false;
    }
    return true;
  };

  const approveAdoption = async (adopter, petID) => {
    if (!checkAdoptionContract) return;
    await props.contracts.adoption
      .approveAdoption(adopter, petID, { from: props.account })
      .then((result) => {
        message.success(
          `Approved adoption for ${petID} by adopter ${adopter}! Transaction hash: ${result.tx}`,
          5
        );
        setIsModalVisible(false);
        getEvents();
      });
  };

  const rejectAdoption = async (adopter, petID) => {
    if (!checkAdoptionContract) return;
    await props.contracts.adoption
      .rejectAdoption(adopter, petID, { from: props.account })
      .then((result) => {
        message.success(
          `Rejected adoption for ${petID} by adopter ${adopter}! Transaction hash: ${result.tx}`,
          5
        );
        setIsModalVisible(false);
        getEvents();
      });
  };

  const columns = [
    {
      title: "Adopter",
      dataIndex: "adopter",
      key: "adopter",
      render: (address) => getEllipsisTxt(address, 8),
    },
    {
      title: "Transaction Hash",
      dataIndex: "tx",
      key: "tx",
      render: (address) => getEllipsisTxt(address, 8),
    },
    {
      title: "Pet ID",
      dataIndex: "petID",
      key: "petID",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (text, record) => (
        <Space size="large">
          <Button
            type="primary"
            size="large"
            onClick={() => {
              setCurTx({
                txHash: record.tx,
                adopter: record.adopter,
                petID: record.petID,
              });
              setIsModalVisible(true);
            }}
          >
            Review Application
          </Button>
        </Space>
      ),
    },
  ];

  const getEvents = useCallback(async () => {
    setIsLoading(true);

    const groupedEvents = adoptionEvents.reduce((acc, cur) => {
      // Group events by pet ID and only store the latest event by comparing the block number.
      const key = cur.returnValues.petID;
      if (!acc[key] || acc[key].blockNumber < cur.blockNumber) {
        acc[key] = cur;
      }
      return acc;
    }, {});
    // Get the latest event object that is waiting for approval (in LOCKED/PENDING) state.
    const pendingEvents = Object.entries(groupedEvents).filter(
      (o) => o[1].returnValues.status == "2"
    );
    // Return data needed for table columns
    const data = pendingEvents.map(async (eventTuple) => {
      const event = eventTuple[1];
      return {
        adopter: event.returnValues.adopter,
        tx: event.transactionHash,
        petID: event.returnValues.petID,
      };
    });
    setHistory(await Promise.all(data));
    setIsLoading(false);
  }, [adoptionEvents]);

  useEffect(() => {
    if (
      props.contracts.adoption &&
      isAuthenticated &&
      account &&
      !history &&
      adoptionEvents.length &&
      props.petsMetadata
    ) {
      getEvents();
    }
  }, [
    props.contracts.adoption,
    getEvents,
    isAuthenticated,
    account,
    props.petsMetadata,
    adoptionEvents,
    history,
  ]);

  return (
    <>
      <div className="table-content">
        <Tooltip title="Reload the data">
          <Button
            shape="circle"
            icon={<SyncOutlined />}
            onClick={getEvents}
            style={{ marginBottom: "16px" }}
          />
        </Tooltip>
        <Table
          className="wallet-desc"
          loading={!history || isLoading}
          dataSource={history}
          columns={columns}
        />
      </div>

      <FormReview
        curTx={curTx}
        visible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        approveAdoption={approveAdoption}
        rejectAdoption={rejectAdoption}
      />
    </>
  );
}
