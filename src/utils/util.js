import { Image } from "antd";
import PlaceHolder from "./placeholder.png";

const { w, h } = (200, 200);
export const sampleData = [
  {
    name: "Dog 1",
    petID: 0,
    img: (
      <Image width={w} height={h} src="nothing.png" fallback={PlaceHolder} />
    ),
    gender: "Male",
    breed: "Husky",
  },
  {
    name: "Dog 2",
    petID: 1,
    img: (
      <Image width={w} height={h} src="nothing.png" fallback={PlaceHolder} />
    ),
    gender: "Female",
    breed: "Golden Retriever",
  },
  {
    name: "Cat 1",
    petID: 2,
    img: (
      <Image width={w} height={h} src="nothing.png" fallback={PlaceHolder} />
    ),
    gender: "Male",
    breed: "British Shorthair",
  },
  {
    name: "Cat 2",
    petID: 3,
    breed: "Tabby",
    img: (
      <Image width={w} height={h} src="nothing.png" fallback={PlaceHolder} />
    ),
    gender: "Male",
  },
];
