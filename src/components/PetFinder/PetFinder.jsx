import React, { useEffect, useState, useRef, useMemo } from "react";
import { Row, Typography } from "antd";
import SearchForm from "./Filter";
import { generateBreedFromData, ageRangeOptions } from "../../utils/util";
import PetList from "../PetLists";
import { useGetAdoptablePets } from "../../hooks/useGetAdoptablePets";

const { Title } = Typography;

export default function PetFinder(props) {
  const pets = props.petsMetadata;
  const { adoptablePets, isLoading } = useGetAdoptablePets(props);
  const [filterResult, setFilterResult] = useState([]);
  const [breedlist, setBreedlist] = useState([]);
  const [breedOption, setBreedOptions] = useState(breedlist);

  function ageFilter(petAge, filterAges) {
    return filterAges.some(
      (i) => petAge >= ageRangeOptions[i].min && petAge < ageRangeOptions[i].max
    );
  }

  function handleTypeChange(e) {
    var res = {};
    if (e?.length)
      e.map((type) => {
        res[type] = breedlist[type];
      });
    else res = breedlist;
    setBreedOptions(res);
  }

  function handleFilter(filters) {
    const result = adoptablePets.filter((el) => {
      return (
        (filters.petType?.length ? filters.petType.includes(el.type) : true) &&
        (filters.ageRange?.length
          ? ageFilter(el.age, filters.ageRange)
          : true) &&
        (filters.petSize?.length ? filters.petSize.includes(el.size) : true) &&
        (filters.breed?.length ? filters.breed.includes(el.breed) : true)
      );
    });
    setFilterResult(result);
  }

  useEffect(() => {
    // console.log("Fetching pets metadata");
    if (adoptablePets.length != 0) {
      setFilterResult(adoptablePets);
      setBreedlist(generateBreedFromData(adoptablePets));
      setBreedOptions(generateBreedFromData(adoptablePets));
    }
  }, [adoptablePets]);

  return (
    <>
      <div className="spaced-container">
        <Title>Find a Pet</Title>
        <SearchForm
          breeds={breedOption}
          ageRange={ageRangeOptions}
          handleFinish={handleFilter}
          handleOnTypeChange={handleTypeChange}
        />
      </div>
      <div
        data-testid="adoption-row"
        className="spaced-container adoption-row"
        style={{ marginTop: "5px", textAlign: "center" }}
      >
        <Title className="adoption-row-title">Results:</Title>
        <PetList dataSource={filterResult} loading={isLoading} />
      </div>
    </>
  );
}
