import { Image } from "antd";
import PlaceHolder from "./placeholder.png";
import Snowy from "../components/pet-imgs/snowy.jpg";
import Lavender from "../components/pet-imgs/GoldenR.jpg";
import Tabby from "../components/pet-imgs/americanS.jpg";
import Puff from "../components/pet-imgs/BritishShorthair.jpg";
import Money from "../components/pet-imgs/pome.jpg";
import Parker from "../components/pet-imgs/persian.jpg";
import Huahua from "../components/pet-imgs/chihuahua.jpg";
import Lucky from "../components/pet-imgs/ragdoll.jpg";
import Luna from "../components/pet-imgs/ragdoll2.jpg";
import Tom from "../components/pet-imgs/BritishShorthair2.jpg";

export const { maxWidth, maxHeight } = (394, 394);

export const sampleData = [
  {
    name: "Snowy",
    type: "Dog",
    petID: 0,
    age: 1,
    img: (
      <Image
        width={maxWidth}
        height={maxHeight}
        src={Snowy}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "M",
    breed: "Mongrel",
    size: 1,
    vaccinated: false,
  },
  {
    name: "Lavender",
    type: "Dog",
    petID: 1,
    age: 29,
    img: (
      <Image
        width={maxWidth}
        height={maxHeight}
        src={Lavender}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "F",
    breed: "Golden Retriever",
    size: 2,
    vaccinated: true,
  },
  {
    name: "Tabby",
    type: "Cat",
    petID: 2,
    age: 5,
    img: (
      <Image
        width={maxWidth}
        height={maxHeight}
        src={Tabby}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "M",
    breed: "American Shorthair",
    size: 2,
    vaccinated: true,
  },
  {
    name: "Puff",
    type: "Cat",
    petID: 3,
    age: 72,
    img: (
      <Image
        width={maxWidth}
        height={maxHeight}
        src={Puff}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "M",
    breed: "British Shorthair",
    size: 1,
    vaccinated: false,
  },
  {
    name: "Money",
    type: "Dog",
    petID: 4,
    age: 34,
    img: (
      <Image
        width={maxWidth}
        height={maxHeight}
        src={Money}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "M",
    breed: "Pomeranian",
    size: 1,
    vaccinated: false,
  },
  {
    name: "Parker",
    type: "Cat",
    petID: 5,
    age: 15,
    img: (
      <Image
        width={maxWidth}
        height={maxHeight}
        src={Parker}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "M",
    breed: "Persian Cat",
    size: 1,
    vaccinated: true,
  },
  {
    name: "Huahua",
    type: "Dog",
    petID: 6,
    age: 53,
    img: (
      <Image
        width={maxWidth}
        height={maxHeight}
        src={Huahua}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "M",
    breed: "Chihuahua",
    size: 0,
    vaccinated: true,
  },
  {
    name: "Lucky",
    type: "Cat",
    petID: 7,
    age: 9,
    img: (
      <Image
        width={maxWidth}
        height={maxHeight}
        src={Lucky}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "M",
    breed: "Ragdoll",
    size: 0,
    vaccinated: true,
  },
  {
    name: "Luna",
    type: "Cat",
    petID: 8,
    age: 12,
    img: (
      <Image
        width={maxWidth}
        height={maxHeight}
        src={Luna}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "M",
    breed: "Ragdoll",
    size: 1,
    vaccinated: false,
  },
  {
    name: "Tom",
    type: "Cat",
    petID: 9,
    age: 44,
    img: (
      <Image
        width={maxWidth}
        height={maxHeight}
        src={Tom}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "M",
    breed: "British Shorthair",
    size: 2,
    vaccinated: true,
  },
];

export const generateBreedFromData = (data) => {
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

export const maxDescLength = 300;

export const maxDogAge = 300;
