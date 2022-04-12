import { Divider, Typography, Row, Col, Button, Space } from "antd";
import React, { useState, useEffect, useCallback } from "react";
import IntroImg from "./img/home-img.jpg";
import { DollarTwoTone, HeartTwoTone } from "@ant-design/icons";
import PetList from "../PetLists";
import { BN } from "../../utils/util";

const { Title, Paragraph, Text } = Typography;

export default function Home(props) {
  const pets = props.petsMetadata;

  const [adoptablePets, setAdoptablePets] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAdoptablePets = useCallback(async () => {
    const adoptableCheck = await Promise.all(
      pets.map(async (o) => {
        return props.contracts.adoption
          .getAdoptionState(o.petID, { from: props.account })
          .then((bnState) => {
            return bnState == 1;
          });
      })
    );
    const _adoptablePets = pets.filter((o, i) => adoptableCheck[i]);
    setAdoptablePets(_adoptablePets);
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
      <Row
        gutter={[20, 20]}
        className="content-row"
        style={{ paddingTop: "20px" }}
      >
        <Col span={24}>
          <Row
            gutter={[20, 20]}
            className="intro-row"
            justify="center"
            style={{ display: "flex" }}
          >
            <Col>
              <Typography style={{ maxWidth: "400px" }}>
                <Title>Introduction</Title>
                <Divider orientation="left"></Divider>
                <Paragraph>
                  ShelterNOW is a decentralised web application for animal
                  sheltering. This project is built on top of blockchain to
                  provide transparency and traceability to donations and animal
                  intakes and outcomes. Support us and rescue the animals now!
                </Paragraph>
              </Typography>
            </Col>
            <Col>
              <img src={IntroImg} alt="Shelter" style={{ width: "320px" }} />
            </Col>
          </Row>
        </Col>
        <Row
          className="btn-row"
          gutter={35}
          justify="center"
          style={{ marginLeft: "26.5%", display: "flex" }}
        >
          <Col>
            <Button
              type="primary"
              shape="round"
              size="large"
              href="/dex"
              className="home-btn"
              style={{
                background: "#FFFF99",
                outline: "1.5px solid #E9AE0B",
                borderColor: "#E9AE0B",
                color: "#000",
                textShadow: "1px 1px 2px rgb(0 0 0 / 30%)",
                boxShadow: "0 3px 5px rgb(12 12 12 / 30%)",
              }}
            >
              <DollarTwoTone
                twoToneColor={"#E9AE0B"}
                style={{ fontSize: "17px" }}
              />
              Buy SNOW
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              shape="round"
              size="large"
              href="/donation"
              className="home-btn"
              style={{
                background: "#ff32ad",
                border: "1px solid #ff32ad",
                color: "#fff",
                textShadow: "1px 1px 2px rgb(0 0 0 / 30%)",
                boxShadow: "0 3px 5px rgb(12 12 12 / 30%)",
              }}
            >
              <HeartTwoTone twoToneColor="red" style={{ fontSize: "17px" }} />
              Donate
            </Button>
          </Col>
        </Row>
      </Row>
      <Row className="content-row adoption-row">
        <Space direction="vertical" size="large">
          <Typography>
            <Title>Adopt a Pet Now!</Title>
            <Text>It is time to find them a home!</Text>
          </Typography>
          <PetList {...props} dataSource={adoptablePets} loading={loading} />
          <Button
            size="Large"
            className="home-btn"
            style={{
              background: "#FAC54B",
              border: "3px solid #7D462F",
              borderRadius: "15px",
              color: "#fff",
              textShadow: "1px 1px 2px rgb(0 0 0 / 30%)",
              boxShadow: "0 3px 5px rgb(12 12 12 / 30%)",
              fontSize: "30px",
              height: "auto",
            }}
          >
            <a href="/findpet">Find More</a>
          </Button>
        </Space>
      </Row>
    </>
  );
}
