import React, { useState } from "react";
import {
  Form,
  Select,
  Input,
  InputNumber,
  Typography,
  Radio,
  Image,
  Button,
  Upload,
  Divider,
  Space,
  Checkbox,
  Card,
  Modal,
  message,
} from "antd";
import { breedOptionGen } from "../PetFinder/Filter";
import {
  LoadingOutlined,
  UploadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  generateBreedFromData,
  typeOptions,
  genderOptions,
  sizeOptions,
  ageRangeOptions,
  maxDescLength,
  maxDogAge,
  maxWidth,
  maxHeight,
} from "../../utils/util";
import PlaceHolder from "../../utils/placeholder.jpg";
import PetTemplate from "./PetTemplate";

const { Title } = Typography;

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

export default function PetForm({ data }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("Dog");
  const [visible, setVisible] = useState(false);
  const breeds = generateBreedFromData(data);
  const [newBreed, setNewbreed] = useState("");
  const [breedList, setBreedList] = useState(breeds);
  const [breedOptions, setBreedOptions] = useState(
    breedOptionGen({ breeds: breedList[type] })
  );

  const onFinish = (values) => {
    console.log("Received values of form: ", values);
  };

  const onTypeChange = (e) => {
    const type_ = e.target.value;
    setType(type_);
    setBreedOptions(breedOptionGen({ breeds: breedList[type_] }));
  };

  const onBreedChange = (e) => {
    setNewbreed(e.target.value);
  };

  const onPreview = () => {
    setVisible(true);
    console.log(form.getFieldsValue());
  };

  const addItem = (e) => {
    e.preventDefault();
    if (newBreed.length > 0) {
      var prevState = { ...breedList };
      prevState[type] = [...prevState[type], newBreed];
      setBreedList({ ...prevState });
      setBreedOptions(breedOptionGen({ breeds: prevState[type] }));
    }
  };

  const dummyRequest = ({ onSuccess }) => {
    onSuccess("Ok");
  };

  function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  const normFile = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, (imageUrl) => {
        form.setFieldsValue({
          img: (
            <Image
              width={maxWidth}
              src={imageUrl}
              placeholder={PlaceHolder}
              className={"pet-img"}
            />
          ),
        });
        setLoading(false);
      });
    }
  };

  const beforeUpload = (file) => {
    getBase64(file, (imageUrl) => {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.addEventListener("load", () => {
        const { width, height } = image;
        console.log([width, height]);
        const ratio = width / height;
        if (ratio < 1 || ratio > 4 / 3) {
          message.warn("A 1:1 or 4:3 aspect ratio image is recommended!");
        }
        if (width < maxWidth || height < maxHeight) {
          message.warn(
            `Image with dimensions at least ${maxWidth} x ${maxHeight} is recommended!!`
          );
        }
      });
    });
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    const sizeOK = file.size < 2 * 1024 * 1024;
    if (!isJpgOrPng) message.error("File must be type JPG or PNG!");
    if (!sizeOK) message.error("File must be smaller than 2MiB");
    return (isJpgOrPng && sizeOK) || Upload.LIST_IGNORE;
  };

  return (
    <Card className="centered-container-small form-container">
      <Title style={{ textAlign: "center" }}>New Pet</Title>
      <Form
        form={form}
        name="create_new"
        initialValues={{ type: "Dog" }}
        {...formItemLayout}
        onFinish={onFinish}
      >
        <Form.Item
          name="name"
          label="Name"
          max={20}
          required
          rules={[
            { required: true, message: "Name cannot be left empty!" },
            { type: "string", max: 20, message: "Name is too long!" },
          ]}
        >
          <Input
            name="name"
            placeholder="Pet's name, e.g. Bailey, Lucky, Chaser"
          />
        </Form.Item>
        <Form.Item
          name="type"
          label="Type/Category"
          rules={[
            {
              required: true,
              message: "Please select the pet's type!",
            },
          ]}
        >
          <Radio.Group
            options={typeOptions}
            optionType="button"
            onChange={onTypeChange}
            buttonStyle="solid"
          />
        </Form.Item>
        <Form.Item
          name="gender"
          label="Gender"
          rules={[
            {
              required: true,
              message: "Please select the pet's gender!",
            },
          ]}
        >
          <Radio.Group
            options={genderOptions}
            optionType="button"
            buttonStyle="solid"
          />
        </Form.Item>
        <Form.Item
          name="size"
          label="Size"
          rules={[
            {
              required: true,
              message: "Please select the pet's size!",
            },
          ]}
        >
          <Radio.Group
            options={sizeOptions}
            optionType="button"
            buttonStyle="solid"
          />
        </Form.Item>
        <Form.Item
          name="age"
          label="Age (Months)"
          required
          rules={[
            { required: true, message: "Please input an age!" },
            {
              type: "number",
              min: 0,
              max: maxDogAge,
              message: `Amount must between 0 to ${maxDogAge}`,
            },
          ]}
        >
          <InputNumber min={0} max={maxDogAge} placeholder="2" />
        </Form.Item>
        <Form.Item name="breed" label="Breed" required>
          <Select
            showSearch
            placeholder="Choose a breed"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            dropdownRender={(menu) => (
              <>
                {menu}
                {type && (
                  <>
                    <Divider style={{ margin: "8px 0" }} />
                    <Space align="center" style={{ padding: "0 8px 4px" }}>
                      <Input
                        placeholder="Please enter item"
                        value={newBreed}
                        onChange={onBreedChange}
                      />
                      <Typography.Link
                        onClick={addItem}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        <PlusOutlined /> Add item
                      </Typography.Link>
                    </Space>
                  </>
                )}
              </>
            )}
          >
            {breedOptions}
          </Select>
        </Form.Item>
        <Form.Item name="vaccinated" label="Vaccinated" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Form.Item name="adoptable" label="Adoptable" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Form.Item name="characteristic" label="Characteristic">
          <Input.TextArea showCount rows={4} maxLength={maxDescLength} />
        </Form.Item>
        <Form.Item name="suggestion" label="Suggestion">
          <Input.TextArea showCount rows={4} maxLength={maxDescLength} />
        </Form.Item>
        <Form.Item name="img" label="Upload Image">
          <Upload
            listType="picture"
            accept="image/jpeg,image/png"
            customRequest={dummyRequest}
            beforeUpload={beforeUpload}
            onChange={normFile}
            maxCount={1}
          >
            <Button icon={loading ? <LoadingOutlined /> : <UploadOutlined />}>
              Upload Thumbnail
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item
          wrapperCol={{
            span: 12,
            offset: 6,
          }}
        >
          <Button onClick={onPreview}>Preview</Button>
          <Modal
            title="Preview Pet Details"
            centered
            visible={visible}
            onOk={() => setVisible(false)}
            onCancel={() => setVisible(false)}
            width="100%"
            className="preview-modal"
          >
            <PetTemplate petMetadata={form.getFieldsValue()} fromNew={true} />
          </Modal>
          <Button type="primary" htmlType="submit" style={{ margin: "0 8px" }}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}