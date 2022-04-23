import React from "react";
import { Card, Col, Row, Typography } from "antd";
import {
  GithubOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  MediumOutlined,
  RedditOutlined,
  TwitterOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const FacebookOutlined = ({ size }) => {
  return (
    <svg
      t="1650658133847"
      className="icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="2008"
      width={size}
      height={size}
      fill="currentColor"
    >
      <path
        d="M889.151 64.223H134.69c-38.601 0-70.182 31.583-70.182 70.182v754.461c0 38.599 31.582 70.182 70.182 70.182h754.461c38.601 0 70.182-31.583 70.182-70.182V134.405c0-38.599-31.582-70.182-70.182-70.182z m-99.008 503.811h-90.234v338.378H575.837V568.034h-90.235V455.238h90.235V319.887c0-56.396 49.592-84.209 78.955-90.236 35.908-7.368 140.991-5.637 140.991-5.637v124.07h-78.955c-22.558 0-22.558 22.562-22.558 22.562v84.592h107.153l-11.28 112.796z"
        p-id="2009"
      ></path>
    </svg>
  );
};

const TelegramOutlined = ({ size }) => {
  return (
    <svg
      t="1650658487810"
      className="icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="2875"
      width={size}
      height={size}
    >
      <path
        d="M679.424 746.861714l84.004571-395.995428c7.424-34.852571-12.580571-48.566857-35.437714-40.009143l-493.714286 190.281143c-33.718857 13.129143-33.133714 32-5.705142 40.557714l126.281142 39.424 293.156572-184.576c13.714286-9.142857 26.294857-3.986286 16.018286 5.156571l-237.129143 214.272-9.142857 130.304c13.129143 0 18.870857-5.705143 25.709714-12.580571l61.696-59.428571 128 94.281142c23.442286 13.129143 40.009143 6.290286 46.299428-21.723428zM1024 512c0 282.843429-229.156571 512-512 512S0 794.843429 0 512 229.156571 0 512 0s512 229.156571 512 512z"
        fill="currentColor"
        p-id="2876"
      ></path>
    </svg>
  );
};

export default function About() {
  return (
    <div className="spaced-container">
      <Card className="centered-container-medium">
        <div>
          <Title>About Us</Title>
        </div>
        <div style={{ padding: "10px 20px" }}>
          <Paragraph>
            ShelterNOW is a decentralised animal shelter, which aims to provide
            a more transparent and auditable platform for animal lovers to
            assist in animal wellbeings. ShelterNOW proposes the usage of
            blockchain in tracking various transactions of the animals shelters
            from amount of donation received to pet intake and outcomes.
          </Paragraph>
        </div>
        <div>
          <Title>Get In Touch</Title>
        </div>
        <div style={{ padding: "10px 20px" }}>
          <Paragraph>
            Want to learn more about our project? Get in touch with us through
            the following ways! We would love to hear from you and grow our
            community.
          </Paragraph>
          <Row className="contact-icons">
            <Col span={3}>
              <FacebookOutlined size={30} />
            </Col>
            <Col span={3}>
              <TwitterOutlined style={{ fontSize: "30px" }} />
            </Col>
            <Col span={3}>
              <InstagramOutlined style={{ fontSize: "30px" }} />
            </Col>
            <Col span={3}>
              <RedditOutlined style={{ fontSize: "30px" }} />
            </Col>
            <Col span={3}>
              <GithubOutlined style={{ fontSize: "30px" }} />
            </Col>
            <Col span={3}>
              <LinkedinOutlined style={{ fontSize: "30px" }} />
            </Col>
            <Col span={3}>
              <MediumOutlined style={{ fontSize: "30px" }} />
            </Col>
            <Col span={3}>
              <TelegramOutlined size={30} />
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
}
