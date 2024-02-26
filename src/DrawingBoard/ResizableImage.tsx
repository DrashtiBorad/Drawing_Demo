import { Fragment, useEffect, useRef, useState } from "react";
import { Image, Transformer } from "react-konva";
import ImageFromLink from "./ImageFromLink";
import { deleteIcon } from "./helper";
import { IMAGE_RESIZE_LIMIT } from "./constants";
import useImage from "./hooks/useImage";

const boundBoxFunc = (oldBox, newBox) =>
  newBox.width < IMAGE_RESIZE_LIMIT || newBox.height < IMAGE_RESIZE_LIMIT
    ? oldBox
    : newBox;

const ResizableImage = ({
  attachmentInfo,
  isSelected,
  onSelect,
  onChange,
  onDelete,
}) => {
  const [image] = useImage(attachmentInfo.imageLink, "Anonimus");

  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const [showDelete, setShowDelete] = useState(true);

  const strokeConfig = isSelected
    ? {
        strokeEnabled: true,
        stroke: "#4060D0",
        strokeWidth: 1,
      }
    : {};

  const onDragStart = () => setShowDelete(false);
  const onDragEnd = (e) => {
    onChange({
      ...attachmentInfo,
      x: e.target.x(),
      y: e.target.y(),
    });
    setShowDelete(true);
  };

  const onTransformStart = () => setShowDelete(false);
  const onTransformEnd = () => {
    // transformer is changing scale of the node
    // and NOT its width or height
    // but in the store we have only width and height
    // to match the data better we will reset scale on transform end
    const node = shapeRef.current;

    if (!node) {
      console.log("unable to find node hence returning...");
      return;
    }

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // we will reset it back
    node.scaleX(1);
    node.scaleY(1);
    node.width(Math.max(5, node.width() * scaleX));
    node.height(Math.max(node.height() * scaleY));

    onChange({
      ...attachmentInfo,
      x: node.x(),
      y: node.y(),
      // set minimal value
      width: node.width(),
      height: node.height(),
    });

    setShowDelete(true);
  };

  return (
    <Fragment>
      <Image
        ref={shapeRef}
        image={image}
        onClick={onSelect}
        onTap={onSelect}
        draggable={isSelected}
        cornerRadius={8}
        onTouchStart={onDragStart}
        onTouchEnd={onDragEnd}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onTransformStart={onTransformStart}
        onTransformEnd={onTransformEnd}
        {...attachmentInfo}
        {...strokeConfig}
      />
      {isSelected && (
        <>
          <Transformer
            ref={trRef}
            // boundBoxFunc={(oldBox, newBox) =>
            //   newBox.width < IMAGE_RESIZE_LIMIT ||
            //   newBox.height < IMAGE_RESIZE_LIMIT
            //     ? oldBox
            //     : newBox
            // }
            boundBoxFunc={boundBoxFunc}
            rotateEnabled={false}
            anchorCornerRadius={4}
            anchorFill="#FFFFFD"
            anchorStroke="#4060D0"
            anchorStrokeWidth={1}
            anchorSize={15}
            keepRatio={false}
            borderEnabled={false}
            enabledAnchors={["bottom-right"]}
          />

          {showDelete && (
            <ImageFromLink
              imageLink={deleteIcon}
              onClick={onDelete}
              onTap={onDelete}
              x={attachmentInfo.x + attachmentInfo.width / 2 - 20}
              y={attachmentInfo.y - 35}
              width={42}
              height={30}
            />
          )}
        </>
      )}
    </Fragment>
  );
};

export default ResizableImage;
