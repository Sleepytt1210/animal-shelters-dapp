import React, { useState, useEffect } from "react";
import {
  Form,
  Select,
  Input,
  InputNumber,
  Typography,
  Radio,
  Image,
  Button,
  Divider,
  Space,
  Checkbox,
  Card,
  Slider,
  Row,
  Col,
  message,
  Empty,
} from "antd";
import { useParams } from "react-router-dom";
import { isInteger, sampleData, SNOWDecimal } from "../../utils/util";
import PlaceHolder from "../../utils/placeholder-square.jpg";
import { CROptions } from "./AddressOption";
import { AdoptionHooks } from "../../hooks/Contracts";
const { Title, Text } = Typography;

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};

const houseOptions = [
  {
    label: "Single Family Home",
    value: "Single Family Home",
  },
  {
    label: "Duplex / Twin",
    value: "Duplex / Twin",
  },
  {
    label: "Condo / Townhome",
    value: "Condo / Townhome",
  },
  {
    label: "Trailer",
    value: "Trailer",
  },
  {
    label: "Apartment",
    value: "Apartment",
  },
];

const binaryOptions = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

export default function AdoptionForm(props) {
  const [form] = Form.useForm();
  const [houseType, setHouseType] = useState("Other");
  const [hasFence, setHasFence] = useState(false);
  const [hasPet, setHasPet] = useState(false);
  const [adoptionFee, setAdoptionFee] = useState(0);

  console.log(props);
  const { requestAdopt } = AdoptionHooks(props);
  if (props.contracts.adoption && adoptionFee === 0) {
    props.contracts.adoption
      .getAdoptionFee({ from: props.account })
      .then((fee) => {
        setAdoptionFee(fee.div(SNOWDecimal));
      });
  }
  const { petID } = useParams();
  const isInt = isInteger(petID);
  const petMetadata = sampleData.find((o) => o.petID == petID);

  const onFinish = (values) => {
    console.log("Received values of form: ", values);
  };

  const onHasFenceChange = (e) => {
    setHasFence(e.target.value);
  };

  const onHasPetChange = (e) => {
    setHasPet(e.target.value);
  };

  const requestAdoption = async (e) => {
    requestAdopt(petID, adoptionFee, (receipt) => {
      message.success("Request adoption success!");
    });
  };

  if (!isInt) {
    return <Empty description={"Invalid Pet ID!"}></Empty>;
  }

  return (
    <Card className="centered-container-medium form-container">
      <Row wrap={false} style={{ alignItems: "center" }}>
        <Col flex="100px">
          <Image
            width={100}
            height={100}
            src={process.env.PUBLIC_URL + "/logo192.png"}
            fallback={PlaceHolder}
          />
        </Col>
        <Col flex="auto">
          <Title style={{ textAlign: "center" }}>
            Pet Adoption Application Form
          </Title>
        </Col>
      </Row>
      <Divider />
      <Form
        form={form}
        name="create_new"
        onFinish={onFinish}
        labelWrap
        labelAlign="left"
        initialValues={{
          petName: petMetadata.name,
          petType: petMetadata.type,
          petBreed: petMetadata.breed,
        }}
        {...formItemLayout}
      >
        <Title level={2}>Pet Details</Title>
        <Divider />
        <Form.Item name="petName" label="Name" disabled>
          <Input name="petName" disabled />
        </Form.Item>
        <Form.Item name="petType" label="Type" disabled>
          <Input name="petType" disabled />
        </Form.Item>
        <Form.Item name="petBreed" label="Breed" disabled>
          <Input name="petBreed" disabled />
        </Form.Item>
        <Divider />
        <Title level={2}>Adopter Details</Title>
        <Divider />
        <Form.Item noStyle>
          <Form.Item
            name="fname"
            label="First Name"
            required
            rules={[
              { required: true, message: "Name cannot be left empty!" },
              { type: "string", max: 20, message: "Name is too long!" },
            ]}
          >
            <Input name="fname" placeholder="Enter your first name" />
          </Form.Item>
          <Form.Item
            name="lname"
            label="Last Name"
            required
            rules={[
              { required: true, message: "Name cannot be left empty!" },
              { type: "string", max: 20, message: "Name is too long!" },
            ]}
          >
            <Input name="lname" placeholder="Enter your last name" />
          </Form.Item>
        </Form.Item>
        <Form.Item
          name="age"
          label="Age"
          required
          rules={[
            { required: true, message: "Please input an age!" },
            {
              type: "number",
              min: 0,
              max: 200,
              message: `Amount must between 0 to ${200}`,
            },
          ]}
        >
          <InputNumber min={0} max={200} placeholder="24" />
        </Form.Item>
        <Form.Item
          name={["address", "street1"]}
          rules={[{ required: true }]}
          label="Street 1"
        >
          <Input name="street1" />
        </Form.Item>
        <Form.Item name={["address", "street2"]} label="Street 2 (Optional)">
          <Input name="street2" />
        </Form.Item>
        <Form.Item
          name={["address", "city"]}
          rules={[{ required: true }]}
          label="City"
        >
          <Input name="street2" />
        </Form.Item>
        <Form.Item
          name={["address", "region"]}
          rules={[{ required: true }]}
          label="Country / Region"
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {CROptions()}
          </Select>
        </Form.Item>
        <Form.Item
          name={["address", "code"]}
          label="Postal / Zip Code"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g NE1 4HZ" style={{ width: "50%" }} />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          validateTrigger="onSubmit"
          rules={[
            {
              required: true,
              message: "${label} is required!",
            },
            {
              type: "email",
              message: "Invalid email pattern!",
            },
          ]}
        >
          <Input type="email" placeholder="example@example.com" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Phone Number"
          validateTrigger="onSubmit"
          normalize={(value) => {
            if (!value) return value;
            if (!isInteger(value)) value = value.substring(0, value.length - 1);
            return value.trim();
          }}
          rules={[
            {
              required: true,
              message: "${label} is required!",
            },
          ]}
        >
          <Input placeholder="Please enter without spacing." />
        </Form.Item>
        <Form.Item
          name="houseType"
          label="I live in a "
          required
          rules={[
            () => ({
              validator(_, value) {
                if (value && value !== "Other") {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Please specify a house type!")
                );
              },
            }),
          ]}
        >
          <Radio.Group className="editable-radio">
            <Space direction="vertical">
              {houseOptions.map((o) => {
                return (
                  <Radio key={o.label} value={o.value}>
                    {o.label}
                  </Radio>
                );
              })}
              <Radio key={"Other"} value={houseType}>
                {
                  <Text
                    editable={{
                      onChange: setHouseType,
                      tooltip: "click to edit text",
                    }}
                  >
                    {houseType} {houseType == "Other" && " (Edit me)"}
                  </Text>
                }
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Do you have a fence?"
          name="hasFence"
          required
          onChange={onHasFenceChange}
          value={hasFence}
        >
          <Radio.Group
            options={binaryOptions}
            optionType="button"
            buttonStyle="solid"
          />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, curValues) => curValues.hasFence}
        >
          {({ getFieldValue }) =>
            getFieldValue("hasFence") ? (
              <Form.Item
                name="fenceHeight"
                label="Height of fence (m)"
                rules={[
                  {
                    required: true,
                    message: "Height of fence is required!",
                  },
                  {
                    type: "number",
                    min: 0,
                    max: 10,
                    message: "Height must between 0 and 10",
                  },
                ]}
              >
                <InputNumber min={0} max={10} />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Form.Item
          name="hasOtherPets"
          label="Do you have other pets?"
          onChange={onHasPetChange}
          value={hasPet}
          required
        >
          <Radio.Group
            options={binaryOptions}
            optionType="button"
            buttonStyle="solid"
          />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, curValues) => curValues.hasOtherPets}
        >
          {({ getFieldValue }) =>
            getFieldValue("hasOtherPets") ? (
              <>
                <Form.Item
                  name="numberOfPets"
                  label="Number of other pets"
                  placeholder="30, put 99 if more than 99"
                  rules={[
                    { required: true, message: "Number of pet is required!" },
                    {
                      type: "number",
                      min: 0,
                      max: 99,
                      message: "Number must between 0 to 99",
                    },
                  ]}
                >
                  <InputNumber min={0} max={99} />
                </Form.Item>
                <Form.Item
                  name="friendlyness"
                  label="Friendliness of other pets"
                >
                  <Slider
                    min={0}
                    max={5}
                    marks={{ 0: "Not friendly", 5: "Very friendly" }}
                  />
                </Form.Item>
              </>
            ) : null
          }
        </Form.Item>

        <Form.Item
          name="petConfine"
          label="Where does the pet stay (be confined) while you are out?"
          placeholder="In the yard"
          required
        >
          <Input maxLength={50} />
        </Form.Item>

        <Form.Item
          name="aloneHours"
          label="Number of hours (average) pet(s) spends alone"
          placeholder="8"
          required
          rules={[
            {
              required: true,
              message: "Hours spend alone is required!",
            },
            {
              type: "number",
              min: 0,
              max: 24,
              message: "Number must between 0 and 24",
            },
          ]}
        >
          <InputNumber maxLength={24} />
        </Form.Item>
        <Form.Item
          name="explaination"
          label={`Explain why do you want to adopt ${petMetadata.name}`}
          required
        >
          <Input.TextArea showCount maxLength={400} />
        </Form.Item>
        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error("You must accept the agreement to continue.")
                    ),
            },
          ]}
          {...tailFormItemLayout}
        >
          <Checkbox>
            I have read the <a href="">agreement</a>
          </Checkbox>
        </Form.Item>
        <Form.Item
          name="infoCorrect"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error(
                        "Please confirm that correctness of the information."
                      )
                    ),
            },
          ]}
          {...tailFormItemLayout}
        >
          <Checkbox>
            I confirm all the information supplied above is correct and
            accurate.
          </Checkbox>
        </Form.Item>
        <Divider>{`Note: You will need to pay a deposit fee of ${adoptionFee} SNOW.`}</Divider>

        <Form.Item style={{ justifyContent: "center", textAlign: "center" }}>
          <Button
            type="primary"
            onClick={requestAdoption}
            htmlType="submit"
            style={{ margin: "0 auto" }}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
