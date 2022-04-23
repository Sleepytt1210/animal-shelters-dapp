import { Row, Col, Statistic } from "antd";
import React from "react";
import { useNativeBalance } from "react-moralis";
import { useSNOWBalance } from "../../hooks/useSNOWBalance";
import { BNTokenValue, tokenValue } from "../../helpers/formatters";
import { SNOWDecimal } from "../../utils/util";

export default function WalletDescriptions({
  totalETHDonation,
  totalSNOWDonation,
  ...props
}) {
  const { data: nativeBalance, nativeToken } = useNativeBalance();
  const { balance } = useSNOWBalance(props);

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
          value={
            (nativeBalance &&
              nativeToken &&
              tokenValue(nativeBalance.balance, nativeToken.decimals)) ||
            0
          }
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
            value={
              (totalETHDonation &&
                tokenValue(totalETHDonation, nativeToken?.decimals || 18)) ||
              0
            }
          />
        </Col>
      </Row>
    </div>
  );
}
