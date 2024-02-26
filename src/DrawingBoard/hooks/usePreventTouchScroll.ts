import { RefObject, useEffect } from "react";

const usePreventTouchScroll = (
  stageRef: RefObject<HTMLCanvasElement | null>
) => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => e.preventDefault();
    const ref = stageRef.current;

    ref?.addEventListener("touchstart", handleClick);
    ref?.addEventListener("touchmove", handleClick);
    ref?.addEventListener("touchend", handleClick);
    ref?.addEventListener("touchcancel", handleClick);

    return () => {
      ref?.removeEventListener("touchstart", handleClick);
      ref?.removeEventListener("touchmove", handleClick);
      ref?.removeEventListener("touchend", handleClick);
      ref?.removeEventListener("touchcancel", handleClick);
    };
  }, []);

  return;
};

export default usePreventTouchScroll;
