import { Row, Col, Statistic, Button } from "antd";
import React, { useState, useEffect, useMemo } from "react";
import { useMoralis, useNativeBalance } from "react-moralis";
import { useERC20Balance } from "../../hooks/useERC20Balance";
import { BN } from "../../utils/util";

export default function WalletDescriptions(props) {
  const { assets } = useERC20Balance();
  const { data: nativeBalance, nativeToken } = useNativeBalance();
  const { Moralis } = useMoralis();
  const [SNOWStats, setSNOWStats] = useState();

  const balances = useMemo(() => {
    if (!assets) return null;
    return [...assets];
  }, [assets]);

  const getSNOW = () => {
    return balances.find(
      (token) => token.token_address === props.contracts.SNOW.address
    );
  };

  const toWei = (bal, dec) => {
    return Moralis?.Units?.toWei(bal, dec);
  };

  useEffect(() => {
    if (props.contracts.SNOW && balances?.length > 0) {
      setSNOWStats(getSNOW());
    }
  }, [props.contracts.SNOW, balances, getSNOW]);

  return (
    <div className="wallet-desc">
      <Row>
        <Statistic
          title="SNOW Balance"
          value={
            (SNOWStats?.balance &&
              toWei(SNOWStats.balance, SNOWStats.decimals)) ||
            10000
          }
        />
      </Row>
      <Row style={{ textAlign: "center" }}>
        <Statistic
          title="ETH Balance"
          value={
            nativeBalance &&
            nativeToken &&
            toWei(nativeBalance.balance, nativeToken.decimals)
          }
        />
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Statistic title="Total SNOW Donated" value={112893} />
        </Col>
        <Col span={12}>
          <Statistic title="Total ETH Donated" value={112893} />
        </Col>
      </Row>
      ,
    </div>
  );
}
