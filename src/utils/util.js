import { Image } from "antd";
import PlaceHolder from "./placeholder.png";
import Web3 from "web3";

export const BN = Web3.utils.toBN;

export const { maxWidth, maxHeight } = (523, 523);

export const metadataTemplate = {
  petID: -1,
  name: "Enter Pet's Name",
  description:
    "Enter description...Enter description...Enter description...Enter description...Enter description...Enter description...Enter description...Enter description...Enter description...Enter description...Enter description...Enter description...",
  suggestion: "Enter suggestion...Enter suggestion...Enter suggestion...",
  img: (
    <Image
      width={maxWidth}
      src={PlaceHolder}
      fallback={PlaceHolder}
      className={"pet-img"}
    />
  ),
  age: 0,
  adoptable: false,
  breed: "Enter Breed",
  gender: "Enter Pet's Gender",
  size: 0,
  type: "Enter Pet's Type",
  vaccinated: false,
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

export const displayAge = (age) => {
  if (age < 12) {
    return `${age} months old`;
  }
  return `${Math.floor(age / 12)} years old`;
};

export const stateToString = {
  0: "Not Adoptable",
  1: "Adoptable",
  2: "Pending",
  3: "Approved",
  4: "Adopted",
  5: "Rejected",
  6: "Cancelled",
  7: "Added",
  8: "Removed",
  9: "Euthanised",
};

export const stateToColor = {
  0: "volcano",
  "Not Adoptable": "volcano",
  1: "green",
  Adoptable: "green",
  2: "orange",
  Pending: "orange",
  3: "geekblue",
  Approved: "geekblue",
  4: "magenta",
  Adopted: "magenta",
  5: "red",
  Rejected: "red",
  6: "red",
  Cancelled: "red",
  7: "#87d068",
  Added: "#87d068",
  8: "red",
  Removed: "red",
  9: "black",
  Euthanised: "black",
};

export const tokenEnum = {
  SNOW: 0,
  ETH: 1,
  0: "SNOW",
  1: "ETH",
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
  return obj && Object.keys(obj).length === 0;
};

export const dynamicToFixed = (float, maxDecimal) => {
  if (float <= 0) return float;
  let acc = maxDecimal;
  let res = float.toFixed(acc);
  while (res == 0 && acc > 1) {
    res = float.toFixed(acc--);
  }
  return res;
};

export const mockData = {
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
