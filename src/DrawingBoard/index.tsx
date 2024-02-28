import { useEffect, useRef, useState } from "react";
import Toolbar from "./Toolbar";
import usePreventTouchScroll from "./hooks/usePreventTouchScroll";
import { Layer, Line, Stage } from "react-konva";
import { CANVAS_HEIGHT, CANVAS_WIDTH, PREV_CANVAS_IAMGE_ID } from "./constants";
import ImageFromLink from "./ImageFromLink";
import {
  bgImageURL,
  downloadURI,
  getBase64,
  handleImageResize,
} from "./helper";
import ResizableImage from "./ResizableImage";

const DrawingBoard = () => {
  const [lines, setLines] = useState([]);
  const [prevCanvasLink, setPrevCanvasLink] = useState<string>(null);
  const [toolsConfig, setToolsConfig] = useState({
    tool: "pen",
    size: 3,
    color: "blue",
  });
  const [isAttachmentSelected, setIsAttachmentSelected] = useState(false);
  const [attachmentInfo, setAttachmentInfo] = useState(null);

  // Refs
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);

  // custom hooks
  usePreventTouchScroll(stageRef);

  /// Effects - START ///

  // Set bg iamge, replicate the flow for loading prev canvas
  // useEffect(() => {
  //   setPrevCanvasLink(bgImageURL);
  // }, []);

  /// Effects - END ///

  /// MOUSE EVENTS - START ///

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();

    // check if user clicked on plain canvas and not on any other object
    const canDeSelectTheShape =
      e.target === e.target.getStage() ||
      e.target.attrs?.id === PREV_CANVAS_IAMGE_ID;

    if (canDeSelectTheShape) setIsAttachmentSelected(false);

    // true will draw dot on click of canvas (only onClick and onTap)
    // let points = canDeSelectTheShape
    //   ? [pos.x, pos.y, pos.x, pos.y]
    //   : [pos.x, pos.y];
    let points = [pos.x, pos.y, pos.x, pos.y];

    setLines([...lines, { points, ...toolsConfig }]);
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current || isAttachmentSelected) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => (isDrawing.current = false);

  // MOUSE EVENTS - ENDs

  /// Methods - START ///

  const onAttachmentDelete = () => {
    setAttachmentInfo(null);
    setIsAttachmentSelected(false);
  };

  const updateToolConfig = (toolsConfig) => {
    if (toolsConfig.tool === "eraser") setIsAttachmentSelected(false);
    setToolsConfig(toolsConfig);
  };

  const onAttachmentChange = async (e) => {
    try {
      const file = e.target.files[0];
      const { base64, width, height } = await getBase64(file);

      let updatedWidth = width;
      let updatedHieght = height;

      // DEFAULT IMAGE POSITION AFTER UPLOAD
      let x = 250;
      let y = 10;

      const imageId = "imageUpload";

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

      setAttachmentInfo({
        x,
        y,
        width: updatedWidth,
        height: updatedHieght,
        id: imageId,
        imageLink: base64,
      });

      setIsAttachmentSelected(true);
      e.target.value = "";
    } catch (error) {
      console.log("Error in onAttachmentChange", error);
    }
  };

  const onCreateNewPage = () => {};

  const onExport = async () => {
    if (!attachmentInfo && !prevCanvasLink && !lines.length) {
      alert("cannot download empty canvas");
      return;
    }

    // remove the selected shape and await for some time to update the ref's value
    setIsAttachmentSelected(false);
    await new Promise((res) => setTimeout(() => res(""), 100));

    // stageRef.current?.findOne(".transparentBackground").show();
    const uri = stageRef.current.toDataURL();
    console.log({ uri });
    downloadURI(uri, "canvas.png");
    // stageRef.current?.findOne(".transparentBackground").hide();
  };

  /// Methods - END ///

  return (
    <>
      <div>{JSON.stringify(toolsConfig)}</div>
      <div
        className="mfev-relative"
        style={{
          maxWidth: CANVAS_WIDTH + "px",
          width: "100%",
          margin: "10px",
        }}
      >
        <Toolbar
          toolsConfig={toolsConfig}
          updateToolConfig={updateToolConfig}
          onAttachmentChange={onAttachmentChange}
          onCreateNewPage={onCreateNewPage}
          disableAttachmentUpload={!!attachmentInfo}
          onExport={onExport}
        />

        <div
          id="drawing-board"
          className="mfev-border-1 mfev-border-Gray-200 mfev-rounded-lg mfev-mt-2.5"
        >
          <Stage
            ref={stageRef}
            // TODO: remove all inline styles
            style={{
              background: 'url("sketch-bg.png")',
              // cursor: cursorType,
            }}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseDown={handleMouseDown}
            onTap={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            <Layer>
              {/* IN LAYER, Z-INDEX WORKS BASED ON ITEMs ORDER */}

              {prevCanvasLink && (
                <ImageFromLink
                  imageLink={prevCanvasLink}
                  id={PREV_CANVAS_IAMGE_ID}
                />
              )}

              {attachmentInfo?.imageLink && (
                <ResizableImage
                  attachmentInfo={attachmentInfo}
                  onSelect={() => setIsAttachmentSelected(true)}
                  onChange={setAttachmentInfo}
                  onDelete={onAttachmentDelete}
                  isSelected={isAttachmentSelected}
                />
              )}

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
    </>
  );
};

export default DrawingBoard;
