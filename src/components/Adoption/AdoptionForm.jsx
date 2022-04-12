import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Modal,
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
  Skeleton,
  Popconfirm,
} from "antd";
import { useParams } from "react-router-dom";
import { isInteger, objectIsEmpty, SNOWDecimal } from "../../utils/util";
import PlaceHolder from "../../utils/placeholder-square.jpg";
import { CROptions } from "./AddressOption";
import { useRequestAdoption } from "../../hooks/useAdoptionHooks";
import { getExplorer } from "../../helpers/networks";
import { useMoralis, useNewMoralisObject } from "react-moralis";

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

const mockData = {
  fname: "Dylon",
  lname: "Wong",
  age: 21,
  address: {
    street1: "Newcastle 1",
    street2: "Blandford Square",
    city: "Newcastle upon Tyne",
    region: "United Kingdom",
    code: "NE1 4HZ",
  },
  email: "C.Y.D.Wong2@ncl.ac.uk",
  phone: "07123456789",
  houseType: "Flat",
  hasFence: true,
  fenceHeight: 2,
  hasOtherPets: true,
  numberOfPets: 2,
  friendliness: 5,
  petConfine:
    "They will be staying in the courtyard or in the house. I have a pet CCTV at home to monitor their behaviours.",
  aloneHours: 8,
  explanation:
    "I love this pet, she looks very friendly and she can have fun with my other pets. They will be good friends! I also want to help out to improve the animal's wellbeing.",
  agreement: true,
  infoCorrect: true,
};

function SuccessModal({ visible, chainId, tx }) {
  return (
    <Modal
      visible={visible}
      footer={null}
      onCancel={() => (window.location = "/home")}
      bodyStyle={{
        textAlign: "center",
        padding: "15px",
        fontSize: "17px",
        fontWeight: "500",
      }}
      style={{ fontSize: "16px", fontWeight: "500" }}
      width="400px"
    >
      <Title level={3}>Application Succeed</Title>
      <Card
        style={{
          marginTop: "10px",
          borderRadius: "1rem",
        }}
        bodyStyle={{ padding: "15px" }}
      >
        {`You have successfully applied for the adoption, please wait for the review of the animal shelters before proceeding to the next step. Your transaction hash is `}
        <a
          href={`${getExplorer(chainId)}/tx/${tx}`}
          target="_blank"
          rel="noreferrer"
        >
          {tx}
        </a>
      </Card>
      <Button
        size="large"
        type="primary"
        style={{
          width: "100%",
          marginTop: "10px",
          borderRadius: "0.5rem",
          fontSize: "16px",
          fontWeight: "500",
        }}
        onClick={() => (window.location = "/home")}
      >
        Back to Home
      </Button>
    </Modal>
  );
}

export default function AdoptionForm(props) {
  const [form] = Form.useForm();
  const [validPet, setValidPet] = useState(true);
  const [houseType, setHouseType] = useState("Other");
  const [hasFence, setHasFence] = useState(false);
  const [hasPet, setHasPet] = useState(false);
  const [adoptionFee, setAdoptionFee] = useState(0);
  const [petMetadata, setPetmetadata] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [txHash, setTxHash] = useState("");
  const { requestAdopt } = useRequestAdoption(props);
  const { petID } = useParams();
  const { chainId } = useMoralis();
  const { save } = useNewMoralisObject("ApplicationForm");

  const adoption = props.contracts.adoption;
  const pets = props.petsMetadata;
  const isInt = isInteger(petID);

  const initPet = useCallback(async () => {
    if (pets.length && !petMetadata.petID) {
      const adoptable = await adoption.getAdoptionState(petID, {
        from: props.account,
      });
      setValidPet(adoptable == 1 && isInt);
      const pet = pets[petID];
      setPetmetadata(pet);
      form.setFieldsValue({
        petName: pet.name,
        petBreed: pet.breed,
        petType: pet.type,
      });
      setIsLoading(false);
    }

    if (adoption && adoptionFee === 0) {
      adoption.getAdoptionFee({ from: props.account }).then((fee) => {
        setAdoptionFee(fee);
      });
    }
  }, [pets, petMetadata, petID, adoption, adoptionFee]);

  useEffect(() => {
    initPet();
  }, [pets, petMetadata, petID]);

  const confirm = () => {
    requestAdoption();
  };

  const onFinish = (values) => {
    console.log("Received values of form: ", values);
  };

  const onHasFenceChange = (e) => {
    setHasFence(e.target.value);
  };

  const onHasPetChange = (e) => {
    setHasPet(e.target.value);
  };

  const requestAdoption = async () => {
    const values = form.getFieldsValue();
    requestAdopt(petID, adoptionFee, (receipt) => {
      const tx =
        receipt.tx ||
        receipt?.transactionHash ||
        receipt.receipt?.transactionHash;
      setTxHash(tx);
      const data = {
        petID: petID,
        adoptStatus: 2,
        txHash: tx,
        date: new Date(),
        ...values,
      };
      save(data, {
        onSuccess: () => {
          message.success("Request adoption success!");
          setSubmitted(true);
        },
      });
    });
  };

  const autoFill = () => {
    setHouseType(mockData.houseType);
    form.setFieldsValue(mockData);
  };

  if (!isLoading && !validPet) {
    return <Empty description={"Invalid Pet ID!"}></Empty>;
  }

  return (
    <Card className="centered-container-medium form-container">
      <Skeleton loading={isLoading}>
        <SuccessModal visible={submitted} chainId={chainId} tx={txHash} />
        <Row wrap={false} style={{ alignItems: "center" }}>
          <Col flex="100px">
            <div onClick={autoFill}>
              <Image
                width={100}
                height={100}
                preview={false}
                src={process.env.PUBLIC_URL + "/logo192.png"}
                fallback={PlaceHolder}
              />
            </div>
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
          name="adoption_application"
          onFinish={onFinish}
          autoComplete
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
              if (!isInteger(value))
                value = value.substring(0, value.length - 1);
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
                    name="friendliness"
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
            name="explanation"
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
          <Divider>{`Note: You will need to pay a deposit fee of ${
            adoptionFee && adoptionFee.div(SNOWDecimal)
          } SNOW.`}</Divider>

          <Form.Item style={{ justifyContent: "center", textAlign: "center" }}>
            <Popconfirm
              disabled={submitted}
              title="Please confirm that your details are correct, you will not be able to change after submission."
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Button
                disabled={submitted}
                type="primary"
                htmlType="submit"
                style={{ margin: "0 auto" }}
              >
                Submit
              </Button>
            </Popconfirm>
          </Form.Item>
        </Form>
      </Skeleton>
    </Card>
  );
}
