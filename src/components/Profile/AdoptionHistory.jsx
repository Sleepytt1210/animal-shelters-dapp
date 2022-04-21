import {
  Image,
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Typography,
  Modal,
  Popconfirm,
  message,
  InputNumber,
} from "antd";
import { SyncOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useCallback } from "react";
import { useMoralis } from "react-moralis";
import PetTemplate from "../Adoption/PetTemplate";
import { BN, stateToColor, stateToString } from "../../utils/util";

const { Text } = Typography;

export default function AdoptionHistory(props) {
  const { isAuthenticated, account } = useMoralis();
  const [history, setHistory] = useState(null);
  const [previewPet, setPreviewPet] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tipAmount, setTipAmount] = useState(0);
  const adoption = props.contracts.adoption;
  const SNOW = props.contracts.SNOW;

  const baseFilter = [
    { text: "Pending", value: "Pending" },
    { text: "Approved", value: "Approved" },
    { text: "Rejected", value: "Rejected" },
    { text: "Cancelled", value: "Cancelled" },
    { text: "Confirmed", value: "Confirmed" },
  ];

  const extendedFilter = [
    { text: "Added", value: "Added" },
    { text: "Removed", value: "Removed" },
    { text: "Euthanised", value: "Euthanised" },
    ...baseFilter,
  ];

  const columns = [
    {
      title: "Pet ID",
      dataIndex: "petID",
      key: "petID",
      defaultSortOrder: "descend",
      sorter: (a, b) => {
        return BN(a.petID) - BN(b.petID);
      },
      render: (petID) => {
        return (
          <Button
            type="link"
            onClick={() => {
              setPreviewPet(props.petsMetadata[petID]);
              setIsModalVisible(true);
            }}
          >
            {petID}
          </Button>
        );
      },
    },
    {
      title: "Pet Image",
      dataIndex: "img",
      key: "img",
      render: (imgUrl) => (
        <Image preview={false} src={imgUrl} width={70} height={70} />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: props.isOwner ? extendedFilter : baseFilter,
      onFilter: (value, record) => record.status.indexOf(value) === 0,
      render: (status) => (
        <Tag color={stateToColor[status]}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      defaultSortOrder: "descend",
      sorter: (a, b) => {
        return a.date - b.date;
      },
      render: (date) => new Date(date).toLocaleDateString("en-GB"),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (text, record) =>
        record.status == "Approved" ? (
          <Space size="medium">
            <Popconfirm
              title={
                <>
                  <div>
                    <Text>Are you sure to confirm the adoption?</Text>
                  </div>
                  <div>
                    {"Tips: "}
                    <InputNumber
                      size="small"
                      onChange={setTipAmount}
                      prefix="SNOW"
                      style={{ width: "100%" }}
                    />
                  </div>
                </>
              }
              okText="Yes"
              cancelText="No"
              onConfirm={() => confirmAdoption(record.petID)}
            >
              <Button
                type="primary"
                shape="round"
                id="confirmAdopt"
                style={{
                  background: "var(--blue)",
                  borderColor: "var(--blue)",
                }}
              >
                Confirm
              </Button>
            </Popconfirm>

            <Popconfirm
              title="Are you sure to cancel the adoption？"
              okText="Yes"
              cancelText="No"
              onConfirm={() => cancelAdoption(record.petID)}
            >
              <Button
                type="primary"
                shape="round"
                id="cancelAdopt"
                style={{ background: "red", borderColor: "var(--red)" }}
              >
                Cancel
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          <Text strong>No action</Text>
        ),
    },
  ];

  const checkContracts = () => {
    if (!adoption || !SNOW) {
      message.error("Adoption Contract or SNOW contract is not loaded!");
      return false;
    }
    return true;
  };

  const confirmAdoption = async (petID) => {
    if (!checkContracts) return;
    if (tipAmount > 0) {
      await SNOW.approve(adoption.address, tipAmount);
    }
    adoption
      .confirmAdoption(petID, tipAmount, { from: props.account })
      .then((result) => {
        message.success(
          `Adoption of ${petID} by adopter ${props.account} is confirmed! Transaction hash: ${result.tx}`,
          5
        );
        getEvents();
      });
  };

  const cancelAdoption = async (petID) => {
    if (!checkContracts) return;
    await adoption
      .cancelAdoption(petID, { from: props.account })
      .then((result) => {
        message.success(
          `Adoption of ${petID} by adopter ${props.account} is cancelled! Transaction hash: ${result.tx}`,
          5
        );
        getEvents();
      });
  };

  const getEvents = useCallback(async () => {
    setIsLoading(true);
    const filteredEvents = await props.contracts.adoption
      .getPastEvents(
        "AdoptionStatus",
        {
          fromBlock: 0,
          toBlock: "latest",
        },
        (errors) => {
          if (errors) {
            console.log("Error in getting past events: ", errors);
            return;
          }
        }
      )
      .then((events) => {
        return events.filter(
          (o) => o.returnValues.adopter.toLowerCase() == account
        );
      })
      .then((accountEvents) => {
        return accountEvents.reduce((acc, cur) => {
          // Group events by pet ID and only store the latest event by comparing the block number.
          const key = cur.returnValues.petID;
          if (!acc[key] || acc[key].blockNumber < cur.blockNumber) {
            acc[key] = cur;
          }
          return acc;
        }, {});
      });

    // Return data needed for table columns
    const formattedData = await Promise.all(
      Object.keys(filteredEvents).map(async (petID) => {
        const event = filteredEvents[petID];
        const block = await props.web3.web3.eth.getBlock(event.blockNumber);
        const date = block.timestamp * 1000;
        const image = props.petsMetadata[petID].img;
        const status = stateToString[event.returnValues.status];
        return { petID: petID, img: image, date: date, status: status };
      })
    );
    setHistory(formattedData);
    setIsLoading(false);
  }, [
    props.contracts.adoption,
    account,
    props.petsMetadata,
    props.web3.web3.eth,
  ]);

  useEffect(() => {
    if (
      props.contracts.adoption &&
      isAuthenticated &&
      account &&
      !history &&
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
    history,
  ]);

  return (
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
        loading={isLoading}
        bordered
        className="adoption-history"
        columns={columns}
        dataSource={history}
      ></Table>
      <Modal
        title="Preview Pet Details"
        centered
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        width="100%"
        className="preview-modal"
      >
        <PetTemplate
          petMetadata={previewPet}
          isLoading={false}
          fromNew={true}
        />
      </Modal>
    </div>
  );
}
