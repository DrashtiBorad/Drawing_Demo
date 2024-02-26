import { Image } from "react-konva";
import { memo } from "react";
import useImage from "./hooks/useImage";

const ImageFromLink = memo(({ imageLink, ...restProps }: any) => {
  const [image] = useImage(imageLink);
  return <Image image={image} {...restProps} />;
});

export default ImageFromLink;
