import {
  BsFillImageFill,
  BsFileEarmarkTextFill,
  BsFillCameraVideoFill,
} from "react-icons/bs";
import { AiFillFile } from "react-icons/ai";
import { PiSpeakerSimpleHighFill } from "react-icons/pi";

export default function fileToIcon(fileType: string): JSX.Element {
  if (fileType.includes("video")) return <BsFillCameraVideoFill />;
  if (fileType.includes("audio")) return <PiSpeakerSimpleHighFill />;
  if (fileType.includes("text")) return <BsFileEarmarkTextFill />;
  if (fileType.includes("image")) return <BsFillImageFill />;
  else return <AiFillFile />;
}
