import React, { useState } from "react";
import PetTemplate from "./template";
import { Card, Typography, Row, Col, Button, Space } from "antd";
import { isInteger, sampleData } from "../../utils/util";
import { useParams } from "react-router-dom";

const { Text } = Typography;

export default function PetDetails() {
  const [isEditable, setEditable] = useState(false);
  const { petID } = useParams();
  const petMetadata = sampleData.find((o) => o.petID == petID);
  const isInt = isInteger(petID);

  if (isInt && petMetadata) {
    return <PetTemplate petMetadata={petMetadata} />;
  } else if (!isInt && petID == "new") {
    return <PetTemplate />;
  } else {
    return (
      <Text>
        Invalid Pet ID! Please enter the correct pet ID or contact the support
        if this issue continues!
      </Text>
    );
  }
}
