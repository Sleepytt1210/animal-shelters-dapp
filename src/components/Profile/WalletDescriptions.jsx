import { Row, Col, Statistic } from "antd";
import React, { useEffect, useState } from "react";
import { useSNOWBalance } from "../../hooks/useSNOWBalance";
import { BNTokenValue, tokenValue } from "../../helpers/formatters";
import { SNOWDecimal } from "../../utils/util";

export default function WalletDescriptions({
  totalETHDonation,
  totalSNOWDonation,
  ...props
}) {
  const { balance } = useSNOWBalance(props);
  const [ETHBalance, setETHBalance] = useState(0);
  const web3 = props.web3.web3;

  useEffect(() => {
    if (web3 && props.account)
      web3.eth.getBalance(props.account).then(setETHBalance);
  }, [web3, props.account]);

  return (
    <div className="wallet-desc">
      <Row>
        <Statistic
          title="SNOW Balance"
          value={(balance && BNTokenValue(balance, SNOWDecimal)) || 0}
        />
      </Row>
      <Row style={{ textAlign: "center" }}>
        <Statistic
          title="ETH Balance"
          value={(ETHBalance && tokenValue(ETHBalance, 18).toFixed(4)) || 0}
        />
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Statistic
            title="Total SNOW Donated"
            value={
              (totalSNOWDonation &&
                BNTokenValue(totalSNOWDonation, SNOWDecimal)) ||
              0
            }
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Total ETH Donated"
            value={(totalETHDonation && tokenValue(totalETHDonation, 18)) || 0}
          />
        </Col>
      </Row>
    </div>
  );
}
