import React, { useEffect, useState, useCallback } from "react";
import { Row, Typography } from "antd";
import SearchForm from "./Filter";
import { generateBreedFromData, ageRangeOptions } from "../../utils/util";
import PetList from "../PetLists";
import { useAdoptionHooks } from "../../hooks/useAdoptionHooks";

const { Title } = Typography;
function ageFilter(petAge, filterAges) {
  return filterAges.some(
    (i) => petAge >= ageRangeOptions[i].min && petAge < ageRangeOptions[i].max
  );
}

export default function PetFinder(props) {
  const pets = props.petsMetadata;

  const [adoptablePets, setAdoptablePets] = useState([]);
  const [filterResult, setFilterResult] = useState(pets);
  const [breedlist, setBreedlist] = useState([]);
  const [loading, setLoading] = useState(true);

  function handleFilter(filters) {
    console.log(filters);
    const result = adoptablePets.filter((el) => {
      return (
        (filters.petType ? filters.petType.includes(el.type) : true) &&
        (filters.ageRange ? ageFilter(el.age, filters.ageRange) : true) &&
        (filters.petSize ? filters.petSize.includes(el.size) : true) &&
        (filters.breed ? filters.breed.includes(el.breed) : true)
      );
    });

    setFilterResult(result);
  }

  const getAdoptablePets = useCallback(async () => {
    const _adoptablePets = await Promise.all(
      pets.map(async (o) => {
        return props.contracts.adoption
          .getAdoptionState(o.petID, { from: props.account })
          .then((bnState) => {
            return bnState == 1;
          });
      })
    ).then((res) => {
      return res.reduce((acc, cur, i) => {
        return cur ? acc.concat({ ...pets[i], adoptable: 1 }) : acc;
      }, []);
    });
    console.log(_adoptablePets);
    setAdoptablePets(_adoptablePets);
    setBreedlist(generateBreedFromData(_adoptablePets));
    setFilterResult(_adoptablePets);
    setLoading(false);
  }, [props.contracts, props.account, pets]);

  useEffect(() => {
    console.log("Fetching pets metadata");
    if (
      props.contracts.adoption &&
      pets?.length > 0 &&
      adoptablePets.length == 0
    )
      getAdoptablePets();
  }, [props.contracts.adoption, pets, adoptablePets, getAdoptablePets]);

  return (
    <>
      <div className="spaced-container">
        <Title>Find a Pet</Title>
        <SearchForm
          breeds={breedlist}
          ageRange={ageRangeOptions}
          handleFinish={handleFilter}
        />
      </div>
      <Row
        className="spaced-container adoption-row"
        style={{ marginTop: "5px", textAlign: "center" }}
      >
        <Title
          style={{
            color: "#000",
            textShadow:
              "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff",
          }}
        >
          Results:
        </Title>
        <PetList dataSource={filterResult} loading={loading} />
      </Row>
    </>
  );
}
