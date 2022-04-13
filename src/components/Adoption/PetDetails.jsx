import React, { useState, useEffect, useCallback } from "react";
import PetTemplate from "./PetTemplate";
import PetForm from "./PetForm";
import { Empty } from "antd";
import { BN, isInteger, objectIsEmpty } from "../../utils/util";
import { useParams } from "react-router-dom";

export default function PetDetails(props) {
  const { petID } = useParams();
  const [petMetadata, setPetMetadata] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const isInt = isInteger(petID);
  const pets = props.petsMetadata;

  const getPetsMetadata = useCallback(async () => {
    const cleanPetID = BN(petID).toString();
    const adoptable = await props.contracts.adoption.getAdoptionState(
      cleanPetID,
      {
        from: props.account,
      }
    );
    setPetMetadata({ ...pets[cleanPetID], adoptable: adoptable == 1 });
    setIsLoading(false);
  }, [petID, pets, props.account, props.contracts.adoption]);

  useEffect(() => {
    if (pets && pets.length && isInt && objectIsEmpty(petMetadata)) {
      getPetsMetadata();
    }
  }, [pets, petMetadata, getPetsMetadata, isInt, petID]);

  if (isInt && petMetadata) {
    return (
      <PetTemplate {...props} petMetadata={petMetadata} isLoading={isLoading} />
    );
  } else if (!isInt && petID == "new") {
    return <PetForm {...props} />;
  } else {
    return <Empty description="Invalid Pet ID!" />;
  }
}
