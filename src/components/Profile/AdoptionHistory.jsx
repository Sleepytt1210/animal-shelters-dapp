import { Image, Table, Button, Space, Tag, Tooltip, Typography } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useCallback } from "react";
import { useMoralis } from "react-moralis";
import { BN, stateToColor, stateToString } from "../../utils/util";

const { Text } = Typography;

export default function AdoptionHistory(props) {
  const { isAuthenticated, account } = useMoralis();
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
            <Button
              type="primary"
              shape="round"
              id="confirmAdopt"
              style={{ background: "var(--blue)", borderColor: "var(--blue)" }}
            >
              Confirm
            </Button>
            <Button
              type="primary"
              shape="round"
              id="cancelAdopt"
              style={{ background: "red", borderColor: "var(--red)" }}
            >
              Cancel
            </Button>
          </Space>
        ) : (
          <Text strong>No action</Text>
        ),
    },
  ];

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
    </div>
  );
}
