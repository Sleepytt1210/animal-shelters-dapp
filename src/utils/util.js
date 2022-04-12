import { Image } from "antd";
import PlaceHolder from "./placeholder.png";
import Web3 from "web3";

export const BN = Web3.utils.toBN;

export const { maxWidth, maxHeight } = (523, 523);

export const metadataTemplate = {
  petID: -1,
  name: "Enter Pet's Name",
  vaccinated: false,
  size: 0,
  img: (
    <Image
      width={maxWidth}
      src={PlaceHolder}
      fallback={PlaceHolder}
      className={"pet-img"}
    />
  ),
  age: 0,
  gender: "Enter Pet's Gender",
  type: "Enter Pet's Type",
  breed: "Enter Breed",
  description:
    "Enter description...Enter description...Enter description...Enter description...Enter description...Enter description...Enter description...Enter description...Enter description...Enter description...Enter description...Enter description...",
  suggestion: "Enter suggestion...Enter suggestion...Enter suggestion...",
  adoptable: false,
};

export const generateBreedFromData = (data) => {
  if (!data || data.length == 0) return {};
  const catBreed = new Set();
  const dogBreed = new Set();
  for (let pet of data) {
    if (pet.type == "Cat") {
      catBreed.add(pet.breed);
    } else {
      dogBreed.add(pet.breed);
    }
  }
  return {
    Cat: Array.from(catBreed.values()),
    Dog: Array.from(dogBreed.values()),
  };
};

export function isInteger(val) {
  return /^\d+$/.test(val);
}

export const typeOptions = [
  { label: "Dog", value: "Dog" },
  { label: "Cat", value: "Cat" },
];

export const genderOptions = [
  { label: "Male", value: "M" },
  { label: "Female", value: "F" },
];

export const sizeOptions = [
  { label: "Small", value: 0 },
  { label: "Medium", value: 1 },
  { label: "Large", value: 2 },
];

export const ageRangeOptions = [
  { label: "0 to 6 Months", min: 0, max: 6 },
  { label: "6 to 12 Months", min: 6, max: 12 },
  { label: "1 to 2 Years", min: 12, max: 24 },
  { label: "2 to 5 Years", min: 24, max: 60 },
  { label: "5 to 7 Years", min: 60, max: 84 },
  { label: "Over 8 Years", min: 84, max: 999 },
];

export const stateToString = {
  0: "Added",
  1: "Added",
  2: "Pending",
  3: "Approved",
  4: "Confirmed",
  5: "Rejected",
  6: "Cancelled",
  7: "Removed",
  8: "Euthanised",
};

export const stateToColor = {
  0: "green",
  1: "green",
  Added: "green",
  2: "orange",
  Pending: "orange",
  3: "geekblue",
  Approved: "geekblue",
  4: "green",
  Confirmed: "green",
  5: "red",
  Rejected: "red",
  6: "red",
  Cancelled: "red",
  7: "red",
  Removed: "red",
  8: "black",
  Euthanised: "black",
};

export const maxDescLength = 300;

export const maxDogAge = 300;

export const SNOWDecimal = BN(1e9);

export const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

export const getText = (file, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsText(file);
};

export const btoa = (str) => {
  return Buffer.from(str, "utf8").toString("base64");
};

export const objectIsEmpty = (obj) => {
  return obj && Object.keys(obj).lentgh === 0;
};
