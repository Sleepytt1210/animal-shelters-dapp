import { useIPFS } from "./useIPFS";

/**
 * This is a hook that loads the NFT metadata in case it doesn't alreay exist
 * If metadata is missing, the object is replaced with a reactive object that updatees when the data becomes available
 * The hook will retry until request is successful (with OpenSea, for now)
 */
export const useGetMetadata = () => {
  const { resolveLink } = useIPFS();
  /**
   * Fet Metadata from URI.
   * @param {string} token_uri
   * @returns metadata
   */
  function getMetadataHook(token_uri) {
    const uri = resolveLink(token_uri);
    //Get the Metadata
    return getMetadata(uri);
  }
  /**
   *  Get metadata from token URI.
   *  Fallback: Fetch from URI
   * @param {string} token_uri
   * @returns void
   */
  async function getMetadata(token_uri) {
    //Validate URI
    if (!token_uri || !token_uri.includes("://")) {
      console.log("getMetadata() Invalid URI", { URI: token_uri });
      return;
    }
    //Get Metadata
    return fetch(token_uri)
      .then((res) => res.json())
      .then(async (metadata) => {
        if (!metadata) {
          //Log
          console.error(
            "useVerifyMetadata.getMetadata() No Metadata found on URI:",
            { URI: token_uri }
          );
        }
        //Handle Setbacks
        else if (
          metadata?.detail &&
          metadata.detail.includes("Request was throttled")
        ) {
          //Log
          console.warn(
            "useVerifyMetadata.getMetadata() Bad Result for:" +
              token_uri +
              "  Will retry later",
            { metadata }
          );
          //Retry That Again after 1s
          setTimeout(function () {
            getMetadata(token_uri);
          }, 1000);
        } //Handle Opensea's {detail: "Request was throttled. Expected available in 1 second."}
        else {
          //Log
          // console.log("Retrieved Metadata from " + token_uri, {
          //   metadata,
          // });

          //Set
          return metadata;
        } //Valid Result
      })
      .catch((err) => {
        console.error("getMetadata() Error Caught:", {
          err,
          URI: token_uri,
        });
      });
  }

  return { getMetadataHook };
};
