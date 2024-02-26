import { useState, useRef, useLayoutEffect } from "react";

const useImage = (url, crossOrigin = undefined, referrerpolicy = undefined) => {
  const statusRef = useRef("loading");
  const imageRef = useRef<any>();

  const [, setStateToken] = useState(0);

  const oldUrl = useRef();
  const oldCrossOrigin = useRef();
  const oldReferrerPolicy = useRef();
  if (
    oldUrl.current !== url ||
    oldCrossOrigin.current !== crossOrigin ||
    oldReferrerPolicy.current !== referrerpolicy
  ) {
    statusRef.current = "loading";
    imageRef.current = undefined;
    oldUrl.current = url;
    oldCrossOrigin.current = crossOrigin;
    oldReferrerPolicy.current = referrerpolicy;
  }

  useLayoutEffect(
    function () {
      if (!url) return;
      var img = document.createElement("img");

      function onload() {
        statusRef.current = "loaded";
        imageRef.current = img;
        setStateToken(Math.random());
      }

      function onerror() {
        statusRef.current = "failed";
        imageRef.current = undefined;
        setStateToken(Math.random());
      }

      img.addEventListener("load", onload);
      img.addEventListener("error", onerror);
      crossOrigin && (img.crossOrigin = crossOrigin);
      referrerpolicy && (img.referrerPolicy = referrerpolicy);
      img.src = url;

      return function cleanup() {
        img.removeEventListener("load", onload);
        img.removeEventListener("error", onerror);
      };
    },
    [url, crossOrigin, referrerpolicy]
  );

  return [imageRef.current, statusRef.current];
};

export default useImage;
