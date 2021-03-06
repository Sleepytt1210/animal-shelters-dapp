import { useMoralisFile } from "react-moralis";
import { getBase64 } from "../utils/util";

export const useIPFS = () => {
  const { saveFile } = useMoralisFile();

  const resolveLink = (url) => {
    if (!url) return url;
    else if (url.includes("https://ipfs.moralis.io:2053/"))
      return url.replace(
        "https://ipfs.moralis.io:2053/",
        "https://gateway.moralisipfs.com/"
      );
    return url.replace("ipfs://", "https://gateway.ipfs.io/ipfs/");
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

  const uploadFile = (petID, base64, ext, onSuccess, onError) => {
    return saveFile(
      `pet-${petID}.${ext}`,
      { base64: base64 },
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
