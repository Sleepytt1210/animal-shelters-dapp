import { Row, Typography } from "antd";
import SearchForm from "./Filter";
import { sampleData, generateBreedFromData } from "../../utils/util";
import PetList from "../PetLists";

const { Title } = Typography;

const breedList = generateBreedFromData(sampleData);

export default function PetFinder() {
  return (
    <>
      <div className="spaced-container">
        <Title>Find a Pet</Title>
        <SearchForm breeds={breedList} />
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
        <PetList dataSource={sampleData} />
      </Row>
    </>
  );
}
