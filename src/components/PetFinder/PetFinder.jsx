import React, { useState } from "react";
import { Row, Typography } from "antd";
import SearchForm from "./Filter";
import {
  sampleData,
  generateBreedFromData,
  ageRangeOptions,
} from "../../utils/util";
import PetList from "../PetLists";

const { Title } = Typography;

const breedList = generateBreedFromData(sampleData);
function ageFilter(petAge, filterAges) {
  return filterAges.every(
    (i) => petAge >= ageRangeOptions[i].min && petAge < ageRangeOptions[i].max
  );
}

export default function PetFinder() {
  const [petList, setPetList] = useState(sampleData);

  function handleFilter(filters) {
    const result = sampleData.filter((el) => {
      return (
        (filters.petType ? filters.petType.indexOf(el.type) >= 0 : true) &&
        (filters.ageRange ? ageFilter(el.age, filters.ageRange) : true) &&
        (filters.petSize ? filters.petSize.indexOf(el.size) >= 0 : true) &&
        (filters.breed ? filters.breed.indexOf(el.breed) >= 0 : true)
      );
    });
    setPetList(result);
  }

  return (
    <>
      <div className="spaced-container">
        <Title>Find a Pet</Title>
        <SearchForm
          breeds={breedList}
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
        <PetList dataSource={petList} />
      </Row>
    </>
  );
}
