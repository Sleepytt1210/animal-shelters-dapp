import { Table, Button, Tooltip } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useCallback } from "react";
import { useMoralis } from "react-moralis";
import { dynamicToFixed, tokenEnum } from "../../utils/util";
import { getEllipsisTxt, tokenValue } from "../../helpers/formatters";
import { useGetDonation } from "../../hooks/useGetDonation";

export default function DonationHistory(props) {
  const { isAuthenticated, account } = useMoralis();
  const { donationEvents, isLoading, getPastDonations } = useGetDonation(props);
  const [history, setHistory] = useState(null);

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
        if (record.currency == "ETH")
          return dynamicToFixed(tokenValue(text, 18), 4);
        else return tokenValue(text, 9).toFixed(2);
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
    console.log("Get Events callback called", donationEvents);
    console.log("Account:", account);
    const filteredEvents = donationEvents.filter(
      (e) => e.returnValues.donor.toLowerCase() == account.toLowerCase()
    );

    console.log("Filtered events", filteredEvents);
    // Return data needed for table columns
    const formattedData = await Promise.all(
      filteredEvents.map(async (event) => {
        const tx = getEllipsisTxt(event.transactionHash, 7);
        const block = await props.web3.eth.getBlock(event.blockNumber);
        const date = block.timestamp * 1000;
        const message = event.returnValues.message;
        const amount = event.returnValues.amount;
        const tokenType = tokenEnum[event.returnValues.tokenType];
        return {
          tx: tx,
          currency: tokenType,
          amount: amount,
          message: message,
          date: date,
        };
      })
    );
    console.log("Formatted event", formattedData);
    setHistory(formattedData);
  }, [account, donationEvents, props.web3]);

  useEffect(() => {
    if (
      props.contracts.donation &&
      isAuthenticated &&
      account &&
      donationEvents &&
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
  ]);

  return (
    <div className="table-content">
      <Tooltip title="Reload the data">
        <Button
          shape="circle"
          icon={<SyncOutlined />}
          onClick={getPastDonations}
          style={{ marginBottom: "16px" }}
        />
      </Tooltip>
      <Table
        data-testid="donationTable"
        loading={isLoading}
        bordered
        className="adoption-history"
        columns={columns}
        dataSource={history}
      ></Table>
    </div>
  );
}
