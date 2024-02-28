import { Button } from "hplx-react-elements-dev";

const colorButtonClasses = "mfev-rounded-[50%] mfev-h-[10px] mfev-w-[10px]";

const Toolbar = ({
  toolsConfig,
  updateToolConfig,
  onAttachmentChange,
  onCreateNewPage,
  disableAttachmentUpload,
  onExport,
}: any) => {
  const updateTools = (key, value) =>
    updateToolConfig({ ...toolsConfig, [key]: value });

  return (
    <div className="mfev-absolute mfev-top-2.5 mfev-gap-2 mfev-right-2 mfev-flex mfev-items-center mfev-z-[1]">
      <div className="mfev-flex mfev-items-center mfev-bg-White mfev-rounded-md mfev-border mfev-border-solid mfev-border-Gray-200 mfev-shadow-md mfev-px-2 mfev-py-1">
        <div className="mfev-flex mfev-gap-2 mfev-items-center mfev-pr-2 mfev-border-r mfev-border-solid mfev-border-Gray-300">
          <button onClick={() => updateTools("tool", "pen")}>
            <img src="/fountain-pen.svg" alt="pen" />
          </button>
          <button onClick={() => updateTools("tool", "eraser")}>
            <img src="/eraser.svg" alt="pen" />
          </button>
        </div>
        <div className="mfev-flex mfev-gap-1 mfev-items-center mfev-px-2 mfev-h-6 mfev-border-r mfev-border-solid mfev-border-Gray-300">
          <button
            className="mfev-px-[2px] mfev-py-[5px]"
            onClick={() => updateTools("size", 1)}
          >
            <div className="mfev-rounded-[50%] mfev-h-[4px] mfev-w-[4px] mfev-bg-Gray-300" />
          </button>
          <button
            className="mfev-px-[2px] mfev-py-[5px]"
            onClick={() => updateTools("size", 2)}
          >
            <div className="mfev-rounded-[50%] mfev-h-[6px] mfev-w-[6px] mfev-bg-Gray-300" />
          </button>
          <button
            className="mfev-px-[2px] mfev-py-[5px]"
            onClick={() => updateTools("size", 4)}
          >
            <div className="mfev-rounded-[50%] mfev-h-[10px] mfev-w-[10px] mfev-bg-Gray-300" />
          </button>
        </div>
        <div className="mfev-flex mfev-gap-1.5 mfev-items-center mfev-pl-2">
          <button
            className={`${colorButtonClasses} mfev-bg-[#1E1E1E]`}
            onClick={() => updateTools("color", "#1E1E1E")}
          />
          <button
            className={`${colorButtonClasses} mfev-bg-[#F34822]`}
            onClick={() => updateTools("color", "#F34822")}
          />
          <button
            className={`${colorButtonClasses} mfev-bg-[#0B99FF]`}
            onClick={() => updateTools("color", "#0B99FF")}
          />
          <button
            className={`${colorButtonClasses} mfev-bg-[#13AE5C]`}
            onClick={() => updateTools("color", "#13AE5C")}
          />
        </div>
      </div>
      <div>
        <label
          aria-disabled={disableAttachmentUpload}
          className={`${
            disableAttachmentUpload
              ? "mfev-bg-Gray-100 mfev-cursor-not-allowed"
              : "mfev-bg-White mfev-cursor-pointer"
          } mfev-block mfev-px-2 mfev-py-[6px] mfev-font-inter-1 mfev-text-1 mfev-border mfev-border-solid mfev-border-Gray-200 mfev-shadow-md mfev-rounded-md`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
          >
            <path
              d="M8.82865 2.80761C10.5847 1.04992 13.434 1.04992 15.1913 2.80728C16.9036 4.51958 16.9475 7.26849 15.3231 9.03394L15.1819 9.18197L8.58193 15.7806L8.5545 15.8033C7.45857 16.7909 5.76807 16.7573 4.71254 15.7018C3.72328 14.7125 3.63169 13.1655 4.43778 12.073C4.45529 12.039 4.47647 12.0062 4.50138 11.9753L4.54155 11.9306L4.60673 11.8648L4.71254 11.7539L4.71473 11.756L10.2915 6.16528C10.491 5.96531 10.8034 5.94674 11.0239 6.10984L11.087 6.16422C11.287 6.36365 11.3056 6.67613 11.1425 6.89655L11.0881 6.95971L5.39212 12.6695C4.85389 13.3262 4.8913 14.2969 5.50435 14.91C6.12615 15.5318 7.11589 15.5614 7.77273 14.9988L14.3972 8.37596C15.7139 7.05773 15.7139 4.9208 14.3958 3.60278C13.119 2.32595 11.0737 2.28604 9.74879 3.48307L9.62288 3.60278L9.61347 3.61351L2.46122 10.7658C2.24155 10.9854 1.8854 10.9854 1.66573 10.7658C1.46603 10.5661 1.44787 10.2536 1.61127 10.0333L1.66573 9.97026L8.82738 2.80728L8.82865 2.80761Z"
              fill="#667085"
            />
          </svg>
          <input
            className="mfev-hidden"
            type="file"
            onChange={onAttachmentChange}
            accept="image/*"
            disabled={disableAttachmentUpload}
          />
        </label>
      </div>
      <Button
        textField="New Page"
        size="sm"
        hierarchy="Secondary-Grey"
        onClick={onCreateNewPage}
      />
      <Button
        textField="Download"
        size="sm"
        hierarchy="Secondary-Grey"
        onClick={onExport}
      />
    </div>
  );
};

export default Toolbar;
