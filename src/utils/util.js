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

const { w, h } = (200, 200);
export const sampleData = [
  {
    name: "Snowy",
    type: "Dog",
    petID: 0,
    age: 14,
    img: (
      <Image
        width={w}
        height={h}
        src={Snowy}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "Male",
    breed: "Mongrel",
  },
  {
    name: "Lavender",
    type: "Dog",
    petID: 1,
    age: 29,
    img: (
      <Image
        width={w}
        height={h}
        src={Lavender}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "Female",
    breed: "Golden Retriever",
  },
  {
    name: "Tabby",
    type: "Cat",
    petID: 2,
    age: 5,
    img: (
      <Image
        width={w}
        height={h}
        src={Tabby}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "Male",
    breed: "American Shorthair",
  },
  {
    name: "Puff",
    type: "Cat",
    petID: 3,
    age: 72,
    img: (
      <Image
        width={w}
        height={h}
        src={Puff}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "Male",
    breed: "British Shorthair",
  },
  {
    name: "Money",
    type: "Dog",
    petID: 4,
    age: 34,
    img: (
      <Image
        width={w}
        height={h}
        src={Money}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "Male",
    breed: "Pomeranian",
  },
  {
    name: "Parker",
    type: "Cat",
    petID: 5,
    age: 15,
    img: (
      <Image
        width={w}
        height={h}
        src={Parker}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "Male",
    breed: "Persian Cat",
  },
  {
    name: "Huahua",
    type: "Dog",
    petID: 6,
    age: 53,
    img: (
      <Image
        width={w}
        height={h}
        src={Huahua}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "Male",
    breed: "Chihuahua",
  },
  {
    name: "Lucky",
    type: "Cat",
    petID: 7,
    age: 9,
    img: (
      <Image
        width={w}
        height={h}
        src={Lucky}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "Male",
    breed: "Ragdoll",
  },
  {
    name: "Luna",
    type: "Cat",
    petID: 8,
    age: 3,
    img: (
      <Image
        width={w}
        height={h}
        src={Luna}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "Male",
    breed: "Ragdoll",
  },
  {
    name: "Tom",
    type: "Cat",
    petID: 9,
    age: 44,
    img: (
      <Image
        width={w}
        height={h}
        src={Tom}
        fallback={PlaceHolder}
        className="pet-list-img"
      />
    ),
    gender: "Male",
    breed: "British Shorthair",
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
    cat: Array.from(catBreed.values()),
    dog: Array.from(dogBreed.values()),
  };
};

export function isInteger(val) {
  return /^\d+$/.test(val);
}
