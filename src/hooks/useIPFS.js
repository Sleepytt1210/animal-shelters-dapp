import { useMoralis, useMoralisFile } from "react-moralis";
import { Moralis } from "moralis";
import { getBase64 } from "../utils/util";

export const useIPFS = () => {
  const { saveFile } = useMoralisFile();

  const resolveLink = (url) => {
    if (!url || !url.includes("ipfs://")) return url;
    return url.replace("ipfs://", "https://gateway.ipfs.io/ipfs/");
  };

  const btoa = (str) => {
    return Buffer.from(str, "utf8").toString("base64");
  };

  const uploadImage = (petID, data, ext, onSuccess, onError) => {
    return getBase64(data, async (base64) => {
      return await saveFile(
        `pet-${petID}.${ext}`,
        { base64 },
        {
          type: "base64",
          saveIPFS: true,
          onSuccess: (result) => onSuccess(result),
          onError: (error) => onError(error),
        }
      );
    });
  };

  const uploadFile = (petID, data, ext, onSuccess, onError) => {
    return saveFile(
      `pet-${petID}.${ext}`,
      { base64: btoa(JSON.stringify(data)) },
      {
        type: "base64",
        saveIPFS: true,
        onSuccess: (result) => onSuccess(result),
        onError: (error) => onError(error),
      }
    );
  };

  return { resolveLink, uploadImage, uploadFile };
};
