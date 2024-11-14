import {
  BsFillImageFill,
  BsFileEarmarkTextFill,
  BsFillCameraVideoFill,
} from "react-icons/bs";
import { AiFillFile } from "react-icons/ai";
import { PiSpeakerSimpleHighFill } from "react-icons/pi";

export const bytesToSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  if (bytes === 0) return "0 Byte";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${size} ${sizes[i]}`;
};

export const fileToIcon = (fileType: string): JSX.Element => {
  if (fileType.includes("video")) return <BsFillCameraVideoFill />;
  if (fileType.includes("audio")) return <PiSpeakerSimpleHighFill />;
  if (fileType.includes("text")) return <BsFileEarmarkTextFill />;
  if (fileType.includes("image")) return <BsFillImageFill />;
  else return <AiFillFile />;
};

export const compressFileName = (fileName: string): string => {
  const maxSubstrLength = 18;

  if (fileName.length > maxSubstrLength) {
    const fileNameWithoutExtension = fileName.split(".").slice(0, -1).join(".");
    const fileExtension = fileName.split(".").pop() || "";

    const charsToKeep =
      maxSubstrLength -
      (fileNameWithoutExtension.length +
        (fileExtension ? fileExtension.length : 0) +
        3);

    const compressedFileName =
      fileNameWithoutExtension.substring(
        0,
        maxSubstrLength - (fileExtension ? fileExtension.length : 0) - 3,
      ) +
      "..." +
      fileNameWithoutExtension.slice(-charsToKeep) +
      "." +
      fileExtension;

    return compressedFileName;
  } else return fileName.trim();
};
