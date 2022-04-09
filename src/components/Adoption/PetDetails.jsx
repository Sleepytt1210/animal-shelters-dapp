import React from "react";
import PetTemplate from "./PetTemplate";
import PetForm from "./PetForm";
import { Empty } from "antd";
import { isInteger, sampleData } from "../../utils/util";
import { useParams } from "react-router-dom";

export default function PetDetails(props) {
  const { petID } = useParams();
  const petMetadata = sampleData.find((o) => o.petID == petID);
  const isInt = isInteger(petID);

  if (isInt && petMetadata) {
    return <PetTemplate {...props} petMetadata={petMetadata} />;
  } else if (!isInt && petID == "new") {
    return <PetForm {...props} data={sampleData} />;
  } else {
    return <Empty description="Invalid Pet ID!" />;
  }
}
