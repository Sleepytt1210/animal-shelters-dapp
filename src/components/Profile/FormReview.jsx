import {
  Modal,
  Divider,
  Descriptions,
  Typography,
  Skeleton,
  Button,
} from "antd";
import { useEffect, useState } from "react";
import { useMoralisQuery, useMoralis } from "react-moralis";
import { getExplorer, getTxExplorer } from "../../helpers/networks";

const { Title } = Typography;

const ExternalLinkOutlined = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
    >
      <path
        style={{ fill: "currentColor" }}
        d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"
      />
    </svg>
  );
};

export default function FormReview(props) {
  const [details, setDetails] = useState({});
  const { chainId } = useMoralis();
  const { data, isLoading } = useMoralisQuery(
    "ApplicationForm",
    (query) => {
      query.equalTo("txHash", props.curTx.txHash).find();
      return query;
    },
    [props.curTx.txHash]
  );

  useEffect(() => {
    if (data.length > 0) {
      setDetails(data[0].toJSON());
    }
  }, [data]);

  return (
    <Skeleton
      loading={!props.visible || isLoading}
      style={{ width: "80%", display: props.visible ? "block" : "none" }}
    >
      <Modal
        data-testid="reviewForm"
        visible={props.visible}
        onOk={() => props.setIsModalVisible(false)}
        onCancel={() => props.setIsModalVisible(false)}
        width="100%"
        footer={[
          <Button key="back" onClick={() => props.setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="approve"
            type="primary"
            loading={isLoading}
            onClick={() =>
              props.approveAdoption(props.curTx.adopter, props.curTx.petID)
            }
          >
            Approve
          </Button>,
          <Button
            key="reject"
            type="primary"
            loading={isLoading}
            onClick={() =>
              props.rejectAdoption(props.curTx.adopter, props.curTx.petID)
            }
            style={{ background: "red", borderColor: "red" }}
          >
            Reject
          </Button>,
        ]}
      >
        <Title>Review Form</Title>
        <Divider />
        <Descriptions bordered>
          <Descriptions.Item label="Transaction Hash" span={3}>
            {details.txHash + " "}
            <a href={`${getTxExplorer(chainId)}/${details.txHash}`}>
              <ExternalLinkOutlined size={15} />
            </a>
          </Descriptions.Item>
          <Descriptions.Item label="Date" span={3}>
            {new Date(details.date?.iso).toLocaleDateString("en-GB")}
          </Descriptions.Item>
          <Descriptions.Item label="Pet ID" span={3}>
            {details.petID}
          </Descriptions.Item>
          <Descriptions.Item label="Pet Name">
            {details.petName}
          </Descriptions.Item>
          <Descriptions.Item label="Pet Type">
            {details.petType}
          </Descriptions.Item>
          <Descriptions.Item label="Pet Breed">
            {details.petBreed}
          </Descriptions.Item>
          <Descriptions.Item label="Adopter's Wallet Address" span={3}>
            {props.curTx.adopter + " "}
            <a href={`${getExplorer(chainId)}/address/${props.curTx.adopter}`}>
              <ExternalLinkOutlined size={15} />
            </a>
          </Descriptions.Item>
          <Descriptions.Item label="First Name">
            {details.fname}
          </Descriptions.Item>
          <Descriptions.Item label="Last Name">
            {details.lname}
          </Descriptions.Item>
          <Descriptions.Item label="Age">{details.age}</Descriptions.Item>
          <Descriptions.Item label="Email" span={1}>
            {details.email}
          </Descriptions.Item>
          <Descriptions.Item label="Phone" span={2}>
            {details.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Address (Street)" span={3}>
            {`${details.address?.street1}${
              details.address?.street2 && ", " + details.address?.street2
            }`}
          </Descriptions.Item>
          <Descriptions.Item label="Zip code">
            {details.address?.code}
          </Descriptions.Item>
          <Descriptions.Item label="City" span={2}>
            {details.address?.city}
          </Descriptions.Item>
          <Descriptions.Item label="House Type">
            {details.houseType}
          </Descriptions.Item>
          <Descriptions.Item label="Has Fence">
            {details.hasFence ? "Yes" : "No"}
          </Descriptions.Item>
          <Descriptions.Item label="Height of Fence">
            {details.fenceHeight || 0}
          </Descriptions.Item>
          <Descriptions.Item label="Has other pets">
            {details.hasOtherPets ? "Yes" : "No"}
          </Descriptions.Item>
          <Descriptions.Item label="Number of pets">
            {details.numberOfPets || 0}
          </Descriptions.Item>
          <Descriptions.Item label="Friendliness">
            {details.friendliness || 0}
          </Descriptions.Item>
          <Descriptions.Item label="Pet confinement" span={3}>
            {details.petConfine}
          </Descriptions.Item>
          <Descriptions.Item label="House spent alone" span={3}>
            {details.aloneHours}
          </Descriptions.Item>
          <Descriptions.Item label="Explanation of adoption request" span={3}>
            {details.explanation}
          </Descriptions.Item>
          <Descriptions.Item label="Terms Agreement" span={3}>
            {details.agreement && "Checked"}
          </Descriptions.Item>
          <Descriptions.Item label="Information correctness declare" span={3}>
            {details.infoCorrect && "Checked"}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </Skeleton>
  );
}
