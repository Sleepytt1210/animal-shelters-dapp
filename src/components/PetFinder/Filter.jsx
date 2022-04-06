import React, { useState } from "react";
import { Form, Row, Col, Input, Button, Select } from "antd";

const { Option, OptGroup } = Select;

function TypeSelector() {
  return (
    <>
      <Select
        mode="multiple"
        allowClear
        placeholder="Choose a pet"
        defaultValue={["Cat", "Dog"]}
      >
        <Option label="Cat" value="Cat">
          Cat
        </Option>
        <Option label="Dog" value="Dog">
          Dog
        </Option>
      </Select>
    </>
  );
}

function AgeRangeSelector() {
  return (
    <>
      <Select mode="multiple" allowClear placeholder="All Ages">
        <Option label="0 to 6 Months" value="0">
          0 to 6 Months
        </Option>
        <Option label="6 to 12 Months" value="1">
          6 to 12 Months
        </Option>
        <Option label="1 to 2 Years" value="2">
          1 to 2 Years
        </Option>
        <Option label="2 to 5 Years" value="3">
          2 to 5 Years
        </Option>
        <Option label="5 to 7 Years" value="4">
          5 to 7 Years
        </Option>
        <Option label="Over 8 Years" value="5">
          Over 8 Years
        </Option>
      </Select>
    </>
  );
}

function SizeSelector() {
  const options = ["Small", "Medium", "Large"];
  return (
    <>
      <Select mode="multiple" allowClear placeholder="All Sizes">
        {options.map((o) => (
          <Option label={o} value={o}>
            {o}
          </Option>
        ))}
      </Select>
    </>
  );
}

function BreedSelector({ breeds }) {
  const optGen = (breeds) => {
    const res = [];
    if (breeds.cat) {
      res.push(
        <OptGroup label="Cat">
          {breeds.cat.map((v) => (
            <Option key={v} label={v}>
              {v}
            </Option>
          ))}
        </OptGroup>
      );
    }
    if (breeds.dog) {
      res.push(
        <OptGroup label="Dog">
          {breeds.dog.map((v) => (
            <Option key={v} label={v}>
              {v}
            </Option>
          ))}
        </OptGroup>
      );
    }
    return res;
  };
  return (
    <>
      <Select
        mode="multiple"
        allowClear
        style={{ width: "100%" }}
        placeholder="Any Breeds"
      >
        {optGen(breeds)}
      </Select>
    </>
  );
}

export default function SearchForm({ breeds }) {
  const { form } = Form.useForm();
  const fields = (breeds) => {
    return [
      {
        label: "Pet Type",
        selector: <TypeSelector />,
        name: "petType",
      },
      {
        label: "Age range",
        selector: <AgeRangeSelector />,
        name: "ageRange",
      },
      {
        label: "Pet Size",
        selector: <SizeSelector />,
        name: "petSize",
      },
      {
        label: "Breed",
        selector: <BreedSelector breeds={breeds} />,
        name: "breed",
      },
    ];
  };

  const fieldComps = [];
  const fieldsGen = (breeds) => {
    for (let i of fields(breeds)) {
      fieldComps.push(
        <Col span={8} key={i.label}>
          <Form.Item
            name={i.name}
            label={i.label}
            labelCol={{ span: 24 }}
            style={{ marginBottom: "15px" }}
          >
            {i.selector}
          </Form.Item>
        </Col>
      );
    }
    return fieldComps;
  };

  return (
    <Form
      form={form}
      name="petFilter"
      style={{
        padding: "10px 20px",
        border: "3px dotted mediumpurple",
        borderRadius: "15px",
      }}
    >
      <Row gutter={20}>
        {fieldsGen(breeds)}
        <Col span={8}></Col>
        <Col
          span={8}
          style={{
            textAlign: "right",
          }}
        >
          <Button type="primary" htmlType="submit">
            Search
          </Button>
          <Button
            style={{
              margin: "0 8px",
            }}
            onClick={() => {
              form.resetFields();
            }}
          >
            Clear
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
