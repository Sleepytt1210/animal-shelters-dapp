import React from "react";
import PetTemplate from "./PetTemplate";
import PetForm from "./PetForm";
import { Typography } from "antd";
import { isInteger, sampleData } from "../../utils/util";
import { useParams } from "react-router-dom";

const { Text } = Typography;

export default function PetDetails() {
  const { petID } = useParams();
  const petMetadata = sampleData.find((o) => o.petID == petID);
  const isInt = isInteger(petID);

  if (isInt && petMetadata) {
    return <PetTemplate petMetadata={petMetadata} />;
  } else if (!isInt && petID == "new") {
    return <PetForm data={sampleData} />;
  } else {
    return (
      <Text>
        Invalid Pet ID! Please enter the correct pet ID or contact the support
        if this issue continues!
      </Text>
    );
  }
}
