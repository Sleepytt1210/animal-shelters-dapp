import { Divider, Typography, Row, Col, Button } from "antd";
import React from "react";
import IntroImg from "./img/home-img.jpg";
import { DollarTwoTone, HeartFilled } from "@ant-design/icons";
import PetList from "../PetLists";
import { useGetAdoptablePets } from "../../hooks/useGetAdoptablePets";

const { Title, Paragraph } = Typography;

export default function Home(props) {
  const { adoptablePets, isLoading } = useGetAdoptablePets(props);

  const croppedAdoptable = adoptablePets.slice(0, 4);

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
                background: "var(--light-yellow)",
                outline: "1.5px solid var(--dull-yellow)",
                borderColor: "var(--dull-yellow)",
                color: "#000",
                textShadow: "1px 1px 2px rgb(0 0 0 / 30%)",
                boxShadow: "0 3px 5px rgb(12 12 12 / 30%)",
              }}
            >
              <DollarTwoTone
                twoToneColor={"#e9ae0b"}
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
                background: "var(--light-pink)",
                border: "2px solid var(--magenta)",
                color: "#fff",
                textShadow: "1px 1px 2px rgb(0 0 0 / 30%)",
                boxShadow: "0 3px 5px rgb(12 12 12 / 30%)",
              }}
            >
              <HeartFilled style={{ color: "red", fontSize: "17px" }} />
              Donate
            </Button>
          </Col>
        </Row>
      </Row>
      <div data-testid="adoption-row" className="content-row adoption-row">
        <div style={{ marginBottom: "1em" }}>
          <Title className="adoption-row-title">Adopt a Pet Now!</Title>
          <Title
            level={3}
            style={{
              fontFamily: "Nunito",
              fontWeight: "600",
            }}
          >
            It is time to find them a home!
          </Title>
        </div>
        <PetList {...props} dataSource={croppedAdoptable} loading={isLoading} />
        <Button
          size="Large"
          className="home-btn"
          style={{
            marginTop: "25px",
            background: "var(--theme-yellow)",
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
      </div>
    </>
  );
}
