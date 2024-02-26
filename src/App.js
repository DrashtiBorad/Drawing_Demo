import React, { Fragment, memo, useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Image, Transformer } from "react-konva";
import { bgImageURL, deleteIcon, getHeightAndWidthFromDataUrl } from "./helper";
import AttachmentImg from "./attachment.svg";
import useImage from "./hook";

const CANVAS_WIDTH = 758;
const CANVAS_HEIGHT = 313;

const IMAGE_RESIZE_LIMIT = 50;
const cmnTooltipBtnClName = "mfev-rounded-[50%] mfev-h-[10px] mfev-w-[10px]";

const ImageFromLink = memo(({ imageLink, ...restProps }) => {
  const [image] = useImage(imageLink);
  return <Image image={image} {...restProps} />;
});

async function getBase64(e) {
  const file = e.target.files[0];
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const diamentions = await getHeightAndWidthFromDataUrl(reader.result);
      resolve({ base64: reader.result, ...diamentions });
    };
    reader.onerror = reject;
  });
}

const Rectangle = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  onDelete,
}) => {
  const [image] = useImage(shapeProps.imageLink, "Anonimus");
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const [showDelete, setshowDelete] = useState(true);

  const strokeConfig = isSelected
    ? {
        strokeEnabled: true,
        stroke: "#4060D0",
        strokeWidth: 1,
      }
    : {};

  return (
    <Fragment>
      <Image
        image={image}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable={isSelected}
        onDragStart={() => {
          setshowDelete(false);
        }}
        cornerRadius={8}
        {...strokeConfig}
        onTouchEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
          setshowDelete(true);
        }}
        onTransformStart={() => {
          setshowDelete(false);
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          node.width(Math.max(5, node.width() * scaleX));
          node.height(Math.max(node.height() * scaleY));

          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: node.width(),
            height: node.height(),
          });

          setshowDelete(true);
        }}
      />
      {isSelected && (
        <>
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (
                newBox.width < IMAGE_RESIZE_LIMIT ||
                newBox.height < IMAGE_RESIZE_LIMIT
              ) {
                return oldBox;
              }
              return newBox;
            }}
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
            <>
              <ImageFromLink
                imageLink={deleteIcon}
                onClick={onDelete}
                onTap={onDelete}
                x={shapeProps.x + shapeProps.width / 2 - 20}
                y={shapeProps.y - 35}
                width={42}
                height={30}
              />
            </>
          )}
        </>
      )}
    </Fragment>
  );
};

const initialRectangles = {
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  id: "rect1",
  imageLink: "https://konvajs.org/assets/lion.png",
};

const defaultToolsConfig = {
  tool: "pen",
  size: 3,
  color: "blue",
};

const App = () => {
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);
  const stageRef = useRef();

  // we will have only one rectangle
  const [rectangles, setRectangles] = useState([initialRectangles]);
  const [selectedShape, setSelectedShape] = useState("rect1");

  const [bgImage, setBgImage] = useState(null);

  const [toolsConfig, setToolsConfig] = useState(defaultToolsConfig);

  const updateTools = (key, value) => {
    setToolsConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();

    const clickedOnEmpty = e.target === e.target.getStage();
    let points = clickedOnEmpty ? [pos.x, pos.y, pos.x, pos.y] : [pos.x, pos.y];
    setLines([...lines, { points, ...toolsConfig }]);
    if (clickedOnEmpty) setSelectedShape(null);
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current || selectedShape) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  function handleImageResize(size, max) {
    // can we maximize the width without exceeding height limit?
    let resize_factor =
      size.height / (size.width / max.width) <= max.height
        ? size.width / max.width
        : size.height / max.height;

    return {
      width: size.width / resize_factor,
      height: size.height / resize_factor,
    };
  }

  const handleFileChange = async (event) => {
    const { base64, width, height } = await getBase64(event);

    let updatedWidth = width;
    let updatedHieght = height;

    let x = 250;
    let y = 10;

    const imageId = "image1";

    if (height > CANVAS_HEIGHT || width > CANVAS_WIDTH) {
      let max = {
        width: CANVAS_WIDTH - 30,
        height: CANVAS_HEIGHT - 30,
      };

      const newData = handleImageResize({ width, height }, max);
      updatedWidth = newData.width;
      updatedHieght = newData.height;

      x = 10;
      y = 10;
    }

    setRectangles([
      {
        x,
        y,
        width: updatedWidth,
        height: updatedHieght,
        id: imageId,
        imageLink: base64,
      },
    ]);

    setSelectedShape(imageId);
  };

  const cursorType =
    toolsConfig.tool === "eraser"
      ? 'url("eraser.cur") 0 100, auto'
      : 'url("tool-pen.cur") 0 100, auto';

  const onDeleteAll = () => {
    setRectangles([]);
    setLines([]);
    setBgImage(null);
  };

  useEffect(() => {
    const handleClick = (e) => e.preventDefault();

    const ref = stageRef.current;
    ref.addEventListener("touchstart", handleClick);
    ref.addEventListener("touchmove", handleClick);
    ref.addEventListener("touchend", handleClick);
    ref.addEventListener("touchcancel", handleClick);

    return () => {
      ref.removeEventListener("touchstart", handleClick);
      ref.removeEventListener("touchmove", handleClick);
      ref.removeEventListener("touchend", handleClick);
      ref.removeEventListener("touchcancel", handleClick);
    };
  }, []);

  return (
    <div
      style={{
        margin: "20px",
        width: "750px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        gap: "10px",
      }}
    >
      <button
        onClick={() => {
          setBgImage(bgImageURL);
        }}
      >
        Set BG image - (actual implementation - load preveious canvas)
      </button>

      <button onClick={onDeleteAll}>Erase all</button>

      <div>
        <label>
          Upload resizable image
          <input
            type="file"
            onChange={(e) => handleFileChange(e)}
            accept="image/*"
          />
        </label>
      </div>

      {/* Toolbar */}
      <div className="mfev-relative">
        <div className="mfev-absolute mfev-top-10 mfev-gap-2 mfev-right-2 mfev-flex mfev-items-center mfev-z-[1]">
          <div className="mfev-flex mfev-items-center mfev-bg-White mfev-rounded-md mfev-border mfev-border-solid mfev-border-Gray-200 mfev-shadow-md mfev-px-2 mfev-py-1">
            <div className="mfev-flex mfev-gap-1 mfev-items-center mfev-pr-2 mfev-border-r mfev-border-solid mfev-border-Gray-300">
              <button onClick={() => updateTools("tool", "pen")}>Pen</button>
              <button
                onClick={() => {
                  updateTools("tool", "eraser");
                  setSelectedShape(false);
                }}
              >
                Rubber
              </button>
            </div>
            <div className="mfev-flex mfev-gap-1 mfev-items-center mfev-px-2 mfev-h-6 mfev-border-r mfev-border-solid mfev-border-Gray-300">
              <button
                className="mfev-rounded-[50%] mfev-h-[4px] mfev-w-[4px] mfev-bg-Gray-300"
                onClick={() => updateTools("size", 1)}
              ></button>
              <button
                className="mfev-rounded-[50%] mfev-h-[6px] mfev-w-[6px] mfev-bg-Gray-300"
                onClick={() => updateTools("size", 2)}
              ></button>
              <button
                className="mfev-rounded-[50%] mfev-h-[10px] mfev-w-[10px] mfev-bg-Gray-300"
                onClick={() => updateTools("size", 3)}
              />
            </div>
            <div className="mfev-flex mfev-gap-1 mfev-items-center mfev-pl-2">
              <button
                className={`${cmnTooltipBtnClName} mfev-bg-[#1E1E1E]`}
                onClick={() => updateTools("color", "#1E1E1E")}
              />
              <button
                className={`${cmnTooltipBtnClName} mfev-bg-[#F34822]`}
                onClick={() => updateTools("color", "#F34822")}
              />
              <button
                className={`${cmnTooltipBtnClName} mfev-bg-[#0B99FF]`}
                onClick={() => updateTools("color", "#0B99FF")}
              />
              <button
                className={`${cmnTooltipBtnClName} mfev-bg-[#13AE5C]`}
                onClick={() => updateTools("color", "#13AE5C")}
              />
            </div>
          </div>
          <div className="mfev-px-2 mfev-py-[6px] mfev-bg-White mfev-font-inter-1 mfev-text-1 mfev-border mfev-border-solid mfev-border-Gray-200 mfev-shadow-md mfev-rounded-md">
            <label htmlFor="file-upload" className="mfev-cursor-pointer">
              <img
                src={AttachmentImg}
                alt="attachment"
                className="attachment-icon"
              />
            </label>
            <input
              id="file-upload"
              className="mfev-hidden"
              type="file"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
          <div className="mfev-px-2 mfev-py-[6px] mfev-bg-White mfev-font-inter-1 mfev-text-1 mfev-border mfev-border-solid mfev-border-Gray-200 mfev-shadow-md mfev-rounded-md">
            New Page
          </div>
        </div>

        {JSON.stringify(toolsConfig)}

        <Stage
          ref={stageRef}
          style={{
            border: "1px solid lightgray",
            borderRadius: "5px",
            maxWidth: "750px",
            width: "100%",
            background: 'url("sketch-bg.png")',
            marginTop: "10px",
            cursor: cursorType,
          }}
          width={750}
          height={300}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            {bgImage && <ImageFromLink imageLink={bgImage} />}

            {/* For Resizable Image */}
            {rectangles.map((rect, i) => {
              return (
                <Rectangle
                  key={i}
                  shapeProps={rect}
                  isSelected={
                    rect.id === selectedShape && toolsConfig.tool !== "eraser"
                  }
                  onSelect={() => {
                    if (toolsConfig.tool !== "eraser")
                      setSelectedShape(rect.id);
                  }}
                  onChange={(newAttrs) => {
                    const rects = rectangles.slice();
                    rects[i] = newAttrs;
                    setRectangles(rects);
                  }}
                  onDelete={() =>
                    setRectangles((prev) =>
                      [...prev].filter((_d, index) => i !== index)
                    )
                  }
                />
              );
            })}

            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.size}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === "eraser" ? "destination-out" : "source-over"
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default App;
