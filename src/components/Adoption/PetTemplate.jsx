import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Divider,
  Image,
  Descriptions,
  Timeline,
  Space,
  Spin,
  Skeleton,
} from "antd";
import React from "react";
import { displayAge, metadataTemplate } from "../../utils/util";
import PlaceHolder from "../../utils/placeholder.jpg";
import Icon, {
  FormOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CheckSquareFilled,
  CloseSquareFilled,
  DollarCircleOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const CatAdopted = () => {
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 200.000000 200.000000"
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)"
        fill="currentColor"
        stroke="none"
      >
        <path
          d="M1145 1760 c-60 -60 -88 -81 -115 -86 -53 -10 -88 -35 -173 -128 -43
   -47 -91 -93 -107 -103 -54 -32 -31 -112 48 -167 38 -26 138 -66 165 -66 11 0
   15 -29 19 -132 6 -139 9 -154 83 -343 24 -62 26 -79 21 -150 -8 -115 -11 -121
   -61 -135 -58 -16 -110 -69 -124 -125 -12 -48 -8 -69 22 -102 l20 -23 403 0
   c387 0 406 1 460 21 66 25 136 85 167 144 19 35 22 56 22 170 0 153 -9 184
   -90 325 -46 80 -55 103 -55 145 0 59 22 100 75 140 30 23 36 34 33 59 -3 27
   -7 31 -35 34 -26 3 -41 -5 -77 -38 -64 -59 -86 -110 -86 -197 0 -63 4 -79 35
   -135 96 -172 108 -204 113 -304 4 -74 1 -104 -12 -139 -20 -51 -78 -106 -129
   -122 l-34 -10 31 60 c28 54 31 71 34 167 7 189 -37 299 -217 542 -142 192
   -151 211 -167 364 -14 136 -33 212 -70 286 -27 54 -90 128 -108 128 -6 0 -47
   -36 -91 -80z"
        />
        <path
          d="M0 1361 l0 -161 35 0 c30 0 62 -20 199 -123 l163 -122 140 -34 c157
   -38 184 -37 204 10 10 27 10 36 -2 58 -12 21 -35 32 -132 61 -71 21 -130 45
   -150 61 -29 23 -124 175 -116 184 2 1 38 -17 79 -41 84 -50 113 -52 143 -13
   29 40 14 68 -83 150 -129 110 -165 123 -337 127 l-143 4 0 -161z"
        />
      </g>
    </svg>
  );
};

const definedProps = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter((o) => o[1] !== undefined)
  );
};

const CatIcon = (props) => <Icon component={CatAdopted} {...props} />;

export default function PetTemplate({ petMetadata, isPreview, isLoading }) {
  const placeHolder = { ...metadataTemplate, ...definedProps(petMetadata) };
  return (
    <Spin spinning={isLoading}>
      <Row gutter={30} className="spaced-container">
        <Col span={7}>
          <Card className="pet-det-card" data-testid="imgcard">
            <Skeleton loading={isLoading}>
              <Title>{placeHolder.name}</Title>
              {
                <Image
                  src={placeHolder.img || placeHolder.imgUrl}
                  placeholder={PlaceHolder}
                />
              }
            </Skeleton>
          </Card>
        </Col>
        <Col span={17}>
          <Card className="pet-det-card" data-testid="desccard">
            <Skeleton loading={isLoading} paragraph={{ rows: 6 }}>
              <Descriptions
                title={
                  <Title level={4} className="pet-det-title">
                    Details
                  </Title>
                }
                style={{ fontSize: "30px", fontFamily: "Fredoka One" }}
                extra={
                  placeHolder.adoptable ? (
                    <Button
                      data-testid="availability"
                      style={{
                        background: "var(--green)",
                        border: "0",
                        fontWeight: "600",
                        color: "#fff",
                        fontFamily: "Nunito",
                      }}
                      shape="round"
                    >
                      Available
                    </Button>
                  ) : (
                    <Button
                      data-testid="availability"
                      style={{
                        background: "red",
                        border: "0",
                        color: "#fff",
                        fontWeight: "600",
                        fontFamily: "Nunito",
                      }}
                      shape="round"
                    >
                      Not Available
                    </Button>
                  )
                }
              >
                <Descriptions.Item label="Name" className="pet-det-desc">
                  {placeHolder.name}
                </Descriptions.Item>
                <Descriptions.Item label="Age" className="pet-det-desc">
                  {displayAge(placeHolder.age)}
                </Descriptions.Item>
                <Descriptions.Item label="Gender" className="pet-det-desc">
                  {placeHolder.gender}
                </Descriptions.Item>
                <Descriptions.Item label="Type" className="pet-det-desc">
                  {placeHolder.type}
                </Descriptions.Item>
                <Descriptions.Item label="Breed" className="pet-det-desc">
                  {placeHolder.breed}
                </Descriptions.Item>
                <Descriptions.Item label="Vaccinated" className="pet-det-desc">
                  {(placeHolder.vaccinated && (
                    <CheckSquareFilled
                      style={{ color: "var(--light-green)", fontSize: "18px" }}
                    />
                  )) || (
                    <CloseSquareFilled
                      style={{ color: "var(--red)", fontSize: "18px" }}
                    />
                  )}
                </Descriptions.Item>
              </Descriptions>
              <Divider />
              <Typography>
                <div data-testid="description">
                  <Title level={4} className="pet-det-title">
                    Description
                  </Title>
                  <Paragraph className="pet-det-desc">
                    {placeHolder.description}
                  </Paragraph>
                </div>
                <div data-testid="suggestion">
                  <Title level={4} className="pet-det-title">
                    Suggestion
                  </Title>
                  <Paragraph className="pet-det-desc">
                    {placeHolder.suggestion}
                  </Paragraph>
                </div>
              </Typography>
            </Skeleton>
          </Card>
        </Col>
      </Row>
      {!isPreview && (
        <>
          <Divider style={{ fontFamily: "Fredoka One", fontSize: "20px" }}>
            Interested in Adoption?
          </Divider>
          <Row gutter={30} className="spaced-container">
            <Col span={24}>
              <Card className="pet-det-card">
                <Title>How to adopt:</Title>

                <Space direction="vertical">
                  <Paragraph>
                    {`Thank you for your interest in rehoming ${petMetadata.name}! Here is what you should know before the adoption:`}
                  </Paragraph>
                  <Timeline>
                    <Timeline.Item
                      dot={<FormOutlined style={{ color: "#000" }} />}
                    >
                      Step 1. Apply for adoption by filling out a request form.
                      You will need to pay a deposit first.
                    </Timeline.Item>
                    <Timeline.Item
                      dot={
                        <ClockCircleOutlined
                          style={{ color: "var(--amber)" }}
                        />
                      }
                    >
                      Step 2. Wait for the animal shelter to review your
                      adoption request.
                    </Timeline.Item>
                    <Timeline.Item
                      dot={
                        <CheckCircleOutlined
                          style={{ color: "var(--light-green)" }}
                        />
                      }
                    >
                      Step 3. Pick up the pet at the animal shelter.
                    </Timeline.Item>
                    <Timeline.Item
                      dot={<CatIcon style={{ color: "var(--blue)" }} />}
                    >
                      Step 4. Get deposit refund and take good care of{" "}
                      {<Text strong>{petMetadata.name}</Text>}!
                    </Timeline.Item>
                    <Timeline.Item
                      label=""
                      dot={
                        <DollarCircleOutlined
                          style={{ color: "var(--magenta)" }}
                        />
                      }
                    >
                      Step 5. (Optional) Tip or Donate to us to support our
                      efforts in aiding and rescueing the animals!
                    </Timeline.Item>
                  </Timeline>
                </Space>
                <Row className="button-row">
                  <Col span={8}>
                    <Button
                      disabled={isPreview}
                      className="adoption-btn"
                      style={{
                        background: "var(--blue)",
                        border: "var(--blue)",
                      }}
                      onClick={() =>
                        (window.location = `/adoptionForm/${petMetadata.petID}`)
                      }
                    >
                      Apply for Adoption
                    </Button>
                  </Col>
                  <Col span={8} style={{ textAlign: "center" }}>
                    <Button
                      disabled={isPreview}
                      style={{ background: "hotpink", border: "hotpink" }}
                      className="adoption-btn"
                    >
                      Donate to ShelterNOW
                    </Button>
                  </Col>
                  <Col span={8} style={{ textAlign: "right" }}>
                    <Button
                      disabled={isPreview}
                      style={{
                        background: "var(--amber)",
                        border: "var(--amber)",
                      }}
                      className="adoption-btn"
                      onClick={() => (window.location = "/findpet")}
                    >
                      See Other Pet
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Spin>
  );
}
