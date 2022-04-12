import React, { useState } from "react";
import { Form, Row, Col, Button, Select } from "antd";
import { sizeOptions } from "../../utils/util";

const { Option, OptGroup } = Select;

function TypeSelector() {
  return (
    <Select
      name="petType"
      mode="multiple"
      allowClear
      placeholder="Choose a pet"
    >
      <Option key="cat-type" value="Cat">
        Cat
      </Option>
      <Option key="dog-type" value="Dog">
        Dog
      </Option>
    </Select>
  );
}

function AgeRangeSelector({ ageRange }) {
  return (
    <Select
      name="ageRange"
      mode="multiple"
      allowClear
      maxTagCount="responsive"
      placeholder="All Ages"
    >
      {ageRange.map((o, i) => (
        <Option key={i} value={i}>
          {o.label}
        </Option>
      ))}
    </Select>
  );
}

function SizeSelector() {
  return (
    <Select name="petSize" mode="multiple" allowClear placeholder="All Sizes">
      {sizeOptions.map(({ label, value }) => (
        <Option key={label} value={value}>
          {label}
        </Option>
      ))}
    </Select>
  );
}

export function breedOptionGen({ breeds }) {
  if (!breeds) return "Empty";
  if (!Array.isArray(breeds)) {
    const breedEntries = Object.entries(breeds);
    return breedEntries.map((tuple) => {
      return (
        <OptGroup key={`${tuple[0]}-breeds`} label={tuple[0]}>
          {tuple[1].map((breed) => {
            return <Option key={breed}>{breed}</Option>;
          })}
        </OptGroup>
      );
    });
  }

  return breeds.map((v) => {
    return <Option key={v}>{v}</Option>;
  });
}

function BreedSelector({ breeds }) {
  return (
    <Select
      name="breed"
      mode="multiple"
      allowClear
      style={{ width: "100%" }}
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      placeholder="Any Breeds"
    >
      {breedOptionGen({ breeds })}
    </Select>
  );
}

export default function SearchForm({ breeds, ageRange, handleFinish }) {
  const [form] = Form.useForm();

  const onReset = () => {
    form.resetFields();
  };

  const fields = (breeds, ageRange) => {
    return [
      {
        label: "Pet Type",
        selector: TypeSelector(),
        name: "petType",
      },
      {
        label: "Age range",
        selector: AgeRangeSelector({ ageRange }),
        name: "ageRange",
      },
      {
        label: "Pet Size",
        selector: SizeSelector(),
        name: "petSize",
      },
      {
        label: "Breed",
        selector: BreedSelector({ breeds }),
        name: "breed",
      },
    ];
  };

  const fieldComps = fields(breeds, ageRange).map((o) => (
    <Col span={8} key={o.label}>
      <Form.Item
        name={o.name}
        label={o.label}
        labelCol={{ span: 24 }}
        style={{ marginBottom: "15px" }}
      >
        {o.selector}
      </Form.Item>
    </Col>
  ));

  return (
    <Form
      form={form}
      name="petFilter"
      onFinish={(v) => handleFinish(v)}
      style={{
        padding: "10px 20px",
        border: "3px dotted mediumpurple",
        borderRadius: "15px",
      }}
    >
      <Row gutter={20}>
        {fieldComps}
        <Col span={8}></Col>
        <Col
          span={8}
          style={{
            textAlign: "right",
          }}
        >
          <Form.Item noStyle>
            <Button type="primary" htmlType="submit">
              Search
            </Button>
          </Form.Item>
          <Form.Item noStyle>
            <Button
              style={{
                margin: "0 8px",
              }}
              onClick={onReset}
            >
              Clear
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
