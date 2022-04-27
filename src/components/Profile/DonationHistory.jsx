import { Table, Button, Tooltip } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useCallback } from "react";
import { useMoralis } from "react-moralis";
import { tokenEnum } from "../../utils/util";
import { getEllipsisTxt, tokenValue } from "../../helpers/formatters";

export default function DonationHistory({ donationEvents, ...props }) {
  const { isAuthenticated, account } = useMoralis();
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const columns = [
    {
      title: "Transaction Hash",
      dataIndex: "tx",
      key: "tx",
    },
    {
      title: "Token Type",
      dataIndex: "currency",
      key: "currency",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text, record) => {
        if (record.currency == "ETH") return tokenValue(text, 18);
        else return tokenValue(text, 9);
      },
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
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
  ];

  const getEvents = useCallback(async () => {
    setIsLoading(true);
    const filteredEvents = donationEvents.filter(
      (e) => e.returnValues.donor.toLowerCase() == account
    );

    // Return data needed for table columns
    const formattedData = await Promise.all(
      filteredEvents.map(async (event) => {
        const tx = getEllipsisTxt(event.transactionHash, 7);
        const block = await props.web3.web3.eth.getBlock(event.blockNumber);
        const date = block.timestamp * 1000;
        const message = event.returnValues.message;
        const amount = event.returnValues.amount;
        console.log(event.returnValues.tokenType);
        const tokenType = tokenEnum[event.returnValues.tokenType];
        console.log("Token type", tokenType);
        return {
          tx: tx,
          currency: tokenType,
          amount: amount,
          message: message,
          date: date,
        };
      })
    );
    setHistory(formattedData);
    setIsLoading(false);
  }, [account, donationEvents, props.web3.web3.eth]);

  useEffect(() => {
    if (
      props.contracts.donation &&
      isAuthenticated &&
      account &&
      !history &&
      props.petsMetadata
    ) {
      getEvents();
    }
  }, [
    props.contracts.donation,
    donationEvents,
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
