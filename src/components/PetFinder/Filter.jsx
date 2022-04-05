import React, { useState } from "react";
import { Form, Row, Col, Input, Button, Select } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

const { Option, OptGroup } = Select;

export function TypeSelector() {
  return (
    <>
      <Select
        mode="multiple"
        allowClear
        style={{ width: "100%" }}
        placeholder="Both"
        defaultValue={["a10", "c12"]}
        onChange={handleChange}
      >
        {children}
      </Select>
    </>
  );
}

export function AgeRangeSelector() {
  return (
    <>
      <Select
        mode="multiple"
        allowClear
        style={{ width: "100%" }}
        placeholder="All Ages"
        defaultValue={["a10", "c12"]}
        onChange={handleChange}
      >
        {children}
      </Select>
    </>
  );
}

export function SizeSelector() {
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

export function BreedSelector({ breeds }) {
  // const optGroupType = !breeds.cat ? 2 : (breeds.dog ? 1 : 0);
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
