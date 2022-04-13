import React, { useState } from "react";
import {
  Form,
  Select,
  Input,
  InputNumber,
  Typography,
  Radio,
  Button,
  Upload,
  Divider,
  Space,
  Checkbox,
  Card,
  Modal,
  message,
  Col,
  Row,
  List,
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
  maxDescLength,
  maxDogAge,
  maxWidth,
  maxHeight,
  getBase64,
  getText,
  btoa,
  BN,
} from "../../utils/util";
import PetTemplate from "./PetTemplate";
import { useIPFS } from "../../hooks/useIPFS";
import { useAddPet } from "../../hooks/useAddPet";

const { Title } = Typography;

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

const typeToExt = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

function BatchForm({ onBatchFinish, ...props }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [JSONFile, setJSONFile] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);

  const normJSONFile = (info) => {
    console.log(info.file.originFileObj);
    if (info.file.status == "done") {
      getText(info.file.originFileObj, (text) => {
        const _pets = JSON.parse(text);
        for (let i in _pets) {
          _pets[i].uploader = generateUploader(i);
        }
        setJSONFile(_pets);
        setThumbnails(new Array(_pets.length));
      });
    }
    return info && info.fileList;
  };

  const normFiles = (e, index) => {
    if (e.file.status === "done") {
      setLoading(false);
      const _thumbnails = thumbnails;
      _thumbnails[index] = e.file;
      setThumbnails(_thumbnails);
    }

    if (e.file.status === "error") {
      setLoading(false);
    }

    if (e.file.status === "uploading") {
      setLoading(true);
      return;
    }
    console.log(e.fileList);
    return e && e.fileList;
  };

  const beforeUploadJSON = (file) => {
    if (file.type !== "application/json") return false;
  };

  const generateUploader = (i) => {
    return (
      <Form.Item
        name={["thumbnail", i]}
        valuePropName="fileList"
        getValueFromEvent={normFiles}
        required
      >
        <Upload
          accept="image/jpeg,image/png"
          listType="picture"
          customRequest={props.dummyRequest}
          showUploadList={{
            showPreviewIcon: false,
            showDownloadIcon: false,
          }}
          onChange={(e) => normFiles(e, i)}
          maxCount={1}
          style={{ height: "150px", width: "150px" }}
        >
          <Button>
            {loading ? <LoadingOutlined /> : <UploadOutlined />}
            Upload Thumbnail
          </Button>
        </Upload>
      </Form.Item>
    );
  };

  return (
    <Form key={2} name="create_batch" form={form}>
      <Modal
        title="Batch Uploads using JSON file"
        centered
        visible={props.fromJSON}
        onOk={() => {
          form
            .validateFields()
            .then(() => {
              form.resetFields();
              const values = {
                json: JSONFile,
                thumbnails: thumbnails,
              };
              onBatchFinish(values);
              setJSONFile([]);
              setThumbnails([]);
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
        }}
        onCancel={() => props.setFromJSON(false)}
        width="75%"
      >
        <Form.Item
          name="json"
          label="Upload JSON File"
          valuePropName="fileList"
          getValueFromEvent={normJSONFile}
          required
        >
          <Upload
            accept=".json"
            name="json"
            customRequest={props.dummyRequest}
            listType="text"
            maxCount={1}
            beforeUpload={beforeUploadJSON}
            onRemove={() => setJSONFile([])}
          >
            <Button icon={<UploadOutlined />}>Click to upload</Button>
          </Upload>
        </Form.Item>
        {JSONFile && JSONFile.length > 0 && JSONFile[0].uploader ? (
          <List
            header={<div>List of Pets uploaded</div>}
            bordered
            dataSource={JSONFile}
            itemLayout="vertical"
            size="small"
            pagination={{
              onChange: (page) => {
                console.log(page);
              },
              pageSize: 5,
            }}
            renderItem={(pet) => (
              <List.Item extra={pet.uploader}>
                <List.Item.Meta
                  title={pet.name}
                  description={pet.description}
                />
              </List.Item>
            )}
          />
        ) : null}
      </Modal>
    </Form>
  );
}

function SingleForm({ onFinish, petsMetadata, ...props }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const breeds = generateBreedFromData(petsMetadata);
  const [newBreed, setNewbreed] = useState("");
  const [breedList, setBreedList] = useState({
    Dog: breeds.Dog,
    Cat: breeds.Cat,
  });
  const [breedOptions, setBreedOptions] = useState();

  const onFromJSON = () => {
    props.setFromJSON(true);
  };

  const onTypeChange = () => {
    const type = form.getFieldValue("type");
    setBreedOptions(breedOptionGen({ breeds: breedList[type] }));
  };

  const onBreedChange = (e) => {
    setNewbreed(e.target.value);
  };

  const onPreview = () => {
    console.log(form.getFieldsValue());
    props.setVisible(true);
  };

  const addItem = (e) => {
    e.preventDefault();
    const type = form.getFieldValue("type");
    if (newBreed.length > 0) {
      var prevState = { ...breedList };
      prevState[type] = [...prevState[type], newBreed];
      setBreedList({ ...prevState });
      setBreedOptions(breedOptionGen({ breeds: prevState[type] }));
    }
  };

  const normFile = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(
        info?.file?.originFileObj || info?.originFileObj,
        (imageUrl) => {
          form.setFieldsValue({
            imgUrl: imageUrl,
            img: info.file,
          });
          setLoading(false);
        }
      );
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
      <Row>
        <Col span={18}>
          <Title style={{ textAlign: "center" }}>New Pet</Title>
        </Col>
        <Col>
          <Button onClick={onFromJSON}>Load from JSON</Button>
        </Col>
      </Row>
      <Form
        form={form}
        name="create_new"
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
            disabled={!form.getFieldValue("type")}
            placeholder={
              form.getFieldValue("type")
                ? "Choose a breed"
                : "Select a type first!"
            }
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            dropdownRender={(menu) => (
              <>
                {menu}
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
          >
            {breedOptions}
          </Select>
        </Form.Item>
        <Form.Item
          name="vaccinated"
          label="Vaccinated"
          valuePropName="checked"
          required
        >
          <Checkbox />
        </Form.Item>
        <Form.Item
          name="adoptable"
          label="Adoptable"
          valuePropName="checked"
          required
        >
          <Checkbox />
        </Form.Item>
        <Form.Item name="description" label="Description" required>
          <Input.TextArea showCount rows={4} maxLength={maxDescLength} />
        </Form.Item>
        <Form.Item name="suggestion" label="Suggestion" required>
          <Input.TextArea showCount rows={4} maxLength={maxDescLength} />
        </Form.Item>
        <Form.Item name="img" label="Upload Image" required>
          <Upload
            listType="picture"
            accept="image/jpeg,image/png"
            customRequest={props.dummyRequest}
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
            visible={props.visible}
            onOk={() => props.setVisible(false)}
            onCancel={() => props.setVisible(false)}
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

export default function PetForm(props) {
  const [visible, setVisible] = useState(false);
  const [fromJSON, setFromJSON] = useState(false);

  const { uploadImage, uploadFile } = useIPFS();
  const { addPet, petCount } = useAddPet(props);

  const dummyRequest = ({ onSuccess }) => {
    onSuccess("Ok");
  };

  const onFinish = async (values, petID) => {
    const _petID = petID || petCount.toString();
    const {
      adoptable: _adoptable,
      img: _img,
      name,
      description,
      uploader: _,
      ...attributes
    } = { ...values, img: values.img.file || values.img };
    return new Promise((resolve, reject) => {
      const uploadMetadata = async (imgIPFS) => {
        message.success(`Image successfully uploaded to IPFS`);
        const metadata = {
          petID: _petID,
          name: name,
          description: description,
          img: imgIPFS._ipfs,
          attributes: attributes,
        };
        const metadataIPFS = await uploadFile(
          _petID,
          btoa(JSON.stringify(metadata)),
          "json",
          (result) => {
            message.success(
              `Metadata successfully uploaded to IPFS at url: ${result._ipfs}`
            );
          },
          console.error
        );
        resolve(
          await addPet(
            metadataIPFS._ipfs,
            _adoptable ? 1 : 0,
            console.log
          ).catch(reject)
        );
      };

      uploadImage(
        _petID,
        _img.originFileObj,
        typeToExt[_img.type],
        uploadMetadata,
        console.error
      );
    });
  };

  const onBatchFinish = async (values) => {
    // Precompute the new pet id batches.
    const petID = petCount;
    if (values.thumbnails.length != values.json.length) return false;
    const { thumbnails, json } = values;
    for (const index in json) {
      const pet = json[index];
      pet.img = thumbnails[index];
      await onFinish(pet, petID + BN(index));
    }
  };

  const extendedProps = {
    ...props,
    visible: visible,
    setVisible: setVisible,
    fromJSON: fromJSON,
    setFromJSON: setFromJSON,
    dummyRequest: dummyRequest,
  };
  return (
    <>
      <SingleForm {...extendedProps} onFinish={onFinish} />
      <BatchForm {...extendedProps} onBatchFinish={onBatchFinish} />
    </>
  );
}
