import React, { useState, useEffect, useCallback } from "react";
import PetTemplate from "./PetTemplate";
import PetForm from "./PetForm";
import { Empty } from "antd";
import { isInteger } from "../../utils/util";
import { useParams } from "react-router-dom";

export default function PetDetails(props) {
  const { petID } = useParams();
  const [petMetadata, setPetMetadata] = useState({});
  const isInt = isInteger(petID);
  const pets = props.petsMetadata;

  const getPetsMetadata = useCallback(async () => {
    const adoptable = await props.contracts.adoption.getAdoptionState(petID, {
      from: props.account,
    });
    setPetMetadata({ ...pets[petID], adoptable: adoptable == 1 });
  }, [petID, pets, props.account, props.contracts.adoption]);

  useEffect(() => {
    if (pets && pets.length && isInt && !petMetadata.petID) {
      getPetsMetadata();
    }
  }, [pets, petMetadata, getPetsMetadata, isInt, petID]);

  if (isInt && petMetadata) {
    return <PetTemplate {...props} petMetadata={petMetadata} />;
  } else if (!isInt && petID == "new") {
    return <PetForm {...props} />;
  } else {
    return <Empty description="Invalid Pet ID!" />;
  }
}
