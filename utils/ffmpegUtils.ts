import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Action } from "@/types";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

const getFileExtension = (fileName: string) => {
  const regex = /(?:\.([^.]+))?$/;
  const match = regex.exec(fileName);
  if (match && match[1]) {
    return match[1];
  }
  return "";
};

const removeFileExtension = (fileName: string) => {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    return fileName.slice(0, lastDotIndex);
  }
  return fileName;
};

export const loadFfmpeg = async (): Promise<FFmpeg> => {
  const ffmpeg = new FFmpeg();
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
  return ffmpeg;
};

export const convertFile = async (
  ffmpeg: FFmpeg,
  action: Action,
): Promise<{ url: string; output: string }> => {
  const { file, to, fileName, fileType } = action;
  const input = getFileExtension(fileName);
  const output = removeFileExtension(fileName) + "." + to;
  ffmpeg.writeFile(input, await fetchFile(file));

  let ffmpegCmd: string[] = [];

  if (to === "3gp")
    ffmpegCmd = [
      "-i",
      input,
      "-r",
      "20",
      "-s",
      "352x288",
      "-vb",
      "400k",
      "-acodec",
      "aac",
      "-strict",
      "experimental",
      "-ac",
      "1",
      "-ar",
      "8000",
      "-ab",
      "24k",
      output,
    ];
  else ffmpegCmd = ["-i", input, output];

  await ffmpeg.exec(ffmpegCmd);

  const data = (await ffmpeg.readFile(output)) as Uint8Array;
  const blob = new Blob([data], { type: fileType.split("/")[0] });
  const url = URL.createObjectURL(blob);
  return { url, output };
};

export const downloadFile = (action: Action) => {
  const a = document.createElement("a");
  a.style.display = "none";
  if (action.url) {
    a.href = action.url;
  }
  if (action.output) {
    a.download = action.output;
  }

  document.body.appendChild(a);
  a.click();

  if (action.url) {
    URL.revokeObjectURL(action.url);
  }
  document.body.removeChild(a);
};
