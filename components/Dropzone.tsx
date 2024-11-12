"use client";

import { FiUploadCloud } from "react-icons/fi";
import { LuFileSymlink } from "react-icons/lu";
import { MdClose } from "react-icons/md";
import { MdDone } from "react-icons/md";
import { BiError } from "react-icons/bi";
import { HiOutlineDownload } from "react-icons/hi";
import { ImSpinner3 } from "react-icons/im";
import { FaPlus } from "react-icons/fa6";

import ReactDropzone from "react-dropzone";
import { FFmpeg } from "@ffmpeg/ffmpeg";

import bytesToSize from "@/utils/bytesToSize";
import fileToIcon from "@/utils/fileToIcon";
import compressFileName from "@/utils/compressFileName";
import convertFile from "@/utils/convertFile";
import loadFfmpeg from "@/utils/loadFfmpeg";

import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import type { Action } from "@/types";

const extensions = {
  image: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "ico",
    "tif",
    "tiff",
    "svg",
    "raw",
    "tga",
  ],
  video: [
    "mp4",
    "m4v",
    "mp4v",
    "3gp",
    "3g2",
    "avi",
    "mov",
    "wmv",
    "mkv",
    "flv",
    "ogv",
    "webm",
    "h264",
    "264",
    "hevc",
    "265",
  ],
  audio: ["mp3", "wav", "ogg", "aac", "wma", "flac", "m4a"],
};

export default function Dropzone() {
  const { toast } = useToast();
  const [isHover, setIsHover] = useState<boolean>(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [files, setFiles] = useState<Array<File>>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [defaultValues, setDefaultValues] = useState<string>("video");
  const acceptedFiles = {
    "image/*": [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".ico",
      ".tif",
      ".tiff",
      ".raw",
      ".tga",
    ],
    "audio/*": [],
    "video/*": [],
  };

  const reset = () => {
    setIsDone(false);
    setActions([]);
    setFiles([]);
    setIsReady(false);
    setIsConverting(false);
  };

  const downloadAll = (): void => {
    for (const action of actions) {
      if (!action.isError) {
        download(action);
      }
    }
  };

  const download = (action: Action) => {
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

  const convert = async (): Promise<void> => {
    let tmpActions = actions.map((elt) => ({
      ...elt,
      isConverting: true,
    }));
    setActions(tmpActions);
    setIsConverting(true);
    for (const action of tmpActions) {
      try {
        if (ffmpegRef.current) {
          const { url, output } = await convertFile(ffmpegRef.current, action);
          tmpActions = tmpActions.map((elt) =>
            elt === action
              ? {
                  ...elt,
                  isConverted: true,
                  isConverting: false,
                  url,
                  output,
                }
              : elt
          );
          setActions(tmpActions);
        }
      } catch {
        tmpActions = tmpActions.map((elt) =>
          elt === action
            ? {
                ...elt,
                isConverted: false,
                isConverting: false,
                isError: true,
              }
            : elt
        );
        setActions(tmpActions);
      }
    }
    setIsDone(true);
    setIsConverting(false);
  };

  const handleUpload = (data: File[]): void => {
    handleExitHover();
    setFiles(data);
    const tmp: Action[] = [];
    data.forEach((file: File) => {
      tmp.push({
        fileName: file.name,
        fileSize: file.size,
        from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
        to: null,
        fileType: file.type,
        file,
        isConverted: false,
        isConverting: false,
        isError: false,
      });
    });
    setActions(tmp);
  };

  const handleHover = (): void => setIsHover(true);
  const handleExitHover = (): void => setIsHover(false);
  const updateAction = (fileName: string, to: string) => {
    setActions(
      actions.map((action): Action => {
        if (action.fileName === fileName) {
          console.log("FOUND");
          return {
            ...action,
            to,
          };
        }

        return action;
      })
    );
  };

  const deleteAction = (action: Action): void => {
    setActions(actions.filter((elt) => elt !== action));
    setFiles(files.filter((elt) => elt.name !== action.fileName));
  };

  const checkIsReady = useCallback((): void => {
    let tmpIsReady = true;
    actions.forEach((action: Action) => {
      if (!action.to) tmpIsReady = false;
    });
    setIsReady(tmpIsReady);
  }, [actions]);

  useEffect(() => {
    if (!actions.length) {
      setIsDone(false);
      setFiles([]);
      setIsReady(false);
      setIsConverting(false);
    } else checkIsReady();
  }, [actions, checkIsReady]);

  const load = async () => {
    const ffmpegResponse: FFmpeg = await loadFfmpeg();
    ffmpegRef.current = ffmpegResponse;
    setIsLoaded(true);
  };

  useEffect(() => {
    load();
  }, []);

  if (actions.length) {
    return (
      <div className="space-y-6">
        {actions.map((action: Action, i: number) => (
          <div
            key={i}
            className="w-full py-4 space-y-2 lg:py-0 relative cursor-pointer rounded-xl border h-fit lg:h-20 px-4 lg:px-10 flex flex-wrap lg:flex-nowrap items-center justify-between"
          >
            {!isLoaded && (
              <Skeleton className="h-full w-full -ml-10 cursor-progress absolute rounded-xl" />
            )}
            <div className="flex gap-4 items-center">
              <span className="text-2xl text-orange-600">
                {fileToIcon(action.fileType)}
              </span>
              <div className="flex items-center gap-1 w-96">
                <span className="text-md font-medium overflow-x-hidden">
                  {compressFileName(action.fileName)}
                </span>
                <span className="text-muted-foreground text-sm">
                  ({bytesToSize(action.fileSize)})
                </span>
              </div>
            </div>
            {action.isError ? (
              <Badge variant="destructive" className="flex gap-2">
                <span>Error Converting File</span>
                <BiError />
              </Badge>
            ) : action.isConverted ? (
              <Badge variant="default" className="flex gap-2 bg-green-500">
                <span>Done</span>
                <MdDone />
              </Badge>
            ) : action.isConverting ? (
              <Badge variant="default" className="flex gap-2">
                <span>Converting</span>
                <span className="animate-spin">
                  <ImSpinner3 />
                </span>
              </Badge>
            ) : (
              <div className="text-muted-foreground text-md flex items-center gap-4">
                <span>Convert to</span>
                <Select
                  onValueChange={(value) => {
                    if (extensions.audio.includes(value)) {
                      setDefaultValues("audio");
                    } else if (extensions.video.includes(value)) {
                      setDefaultValues("video");
                    }
                    updateAction(action.fileName, value);
                  }}
                  value={action.to || "..."}
                >
                  <SelectTrigger className="w-32 outline-none focus:outline-none focus:ring-0 text-center text-muted-foreground bg-background text-md font-medium">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                  <SelectContent className="h-fit">
                    {action.fileType.includes("image") && (
                      <div className="grid grid-cols-2 gap-2 w-fit">
                        {extensions.image.map((elt, i) => (
                          <div key={i} className="col-span-1 text-center">
                            <SelectItem value={elt} className="mx-auto">
                              {elt}
                            </SelectItem>
                          </div>
                        ))}
                      </div>
                    )}
                    {action.fileType.includes("video") && (
                      <Tabs defaultValue={defaultValues} className="w-full">
                        <TabsList className="w-full">
                          <TabsTrigger value="video" className="w-full">
                            Video
                          </TabsTrigger>
                          <TabsTrigger value="audio" className="w-full">
                            Audio
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="video">
                          <div className="grid grid-cols-3 gap-2 w-fit">
                            {extensions.video.map((elt, i) => (
                              <div key={i} className="col-span-1 text-center">
                                <SelectItem value={elt} className="mx-auto">
                                  {elt}
                                </SelectItem>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="audio">
                          <div className="grid grid-cols-3 gap-2 w-fit">
                            {extensions.audio.map((elt, i) => (
                              <div key={i} className="col-span-1 text-center">
                                <SelectItem value={elt} className="mx-auto">
                                  {elt}
                                </SelectItem>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                    {action.fileType.includes("audio") && (
                      <div className="grid grid-cols-2 gap-2 w-fit">
                        {extensions.audio.map((elt, i) => (
                          <div key={i} className="col-span-1 text-center">
                            <SelectItem value={elt} className="mx-auto">
                              {elt}
                            </SelectItem>
                          </div>
                        ))}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            {action.isConverted ? (
              <Button variant="outline" onClick={() => download(action)}>
                Download
              </Button>
            ) : (
              <span
                onClick={() => deleteAction(action)}
                className="cursor-pointer hover:bg-muted rounded-full h-10 w-10 flex items-center justify-center text-2xl text-foreground"
              >
                <MdClose />
              </span>
            )}
          </div>
        ))}
        {!isDone && !isConverting && (
          <ReactDropzone
            onDrop={(acceptedFiles) => {
              handleUpload([...files, ...acceptedFiles]);
            }}
            onDragEnter={handleHover}
            onDragLeave={handleExitHover}
            accept={acceptedFiles}
            onDropRejected={() => {
              handleExitHover();
              toast({
                variant: "destructive",
                title: "Error uploading your file(s)",
                description: "Allowed Files: Audio, Video and Images.",
                duration: 5000,
              });
            }}
            onError={() => {
              handleExitHover();
              toast({
                variant: "destructive",
                title: "Error uploading your file(s)",
                description: "Allowed Files: Audio, Video and Images.",
                duration: 5000,
              });
            }}
          >
            {({ getRootProps, getInputProps }) => (
              <div
                {...getRootProps()}
                className=" bg-background h-72 lg:h-80 xl:h-96 rounded-3xl shadow-sm border-secondary border-2 border-dashed cursor-pointer flex items-center justify-center"
              >
                <input {...getInputProps()} />
                <div className="space-y-4 text-foreground">
                  {isHover ? (
                    <>
                      <div className="justify-center flex text-6xl">
                        <LuFileSymlink />
                      </div>
                      <h3 className="text-center font-medium text-2xl">
                        Yes, right there
                      </h3>
                    </>
                  ) : (
                    <>
                      <div className="justify-center flex text-6xl">
                        <FaPlus />
                      </div>
                      <h3 className="text-center font-medium text-2xl">
                        Add more files
                      </h3>
                    </>
                  )}
                </div>
              </div>
            )}
          </ReactDropzone>
        )}

        <div className="flex w-full justify-end">
          {isDone ? (
            <div className="space-y-4 w-fit">
              <Button
                size="lg"
                className="rounded-xl font-semibold relative py-4 text-md flex gap-2 items-center w-full"
                onClick={downloadAll}
              >
                {actions.length > 1 ? "Download All" : "Download"}
                <HiOutlineDownload />
              </Button>
              <Button
                size="lg"
                onClick={reset}
                variant="outline"
                className="rounded-xl"
              >
                Convert Another File(s)
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              disabled={!isReady || isConverting}
              className="rounded-xl font-semibold relative py-4 text-md flex items-center w-44"
              onClick={convert}
            >
              {isConverting ? (
                <span className="animate-spin text-lg">
                  <ImSpinner3 />
                </span>
              ) : (
                <span>Convert Now</span>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <ReactDropzone
      onDrop={handleUpload}
      onDragEnter={handleHover}
      onDragLeave={handleExitHover}
      accept={acceptedFiles}
      onDropRejected={() => {
        handleExitHover();
        toast({
          variant: "destructive",
          title: "Error uploading your file(s)",
          description: "Allowed Files: Audio, Video and Images.",
          duration: 5000,
        });
      }}
      onError={() => {
        handleExitHover();
        toast({
          variant: "destructive",
          title: "Error uploading your file(s)",
          description: "Allowed Files: Audio, Video and Images.",
          duration: 5000,
        });
      }}
    >
      {({ getRootProps, getInputProps }) => (
        <div
          {...getRootProps()}
          className=" bg-background h-72 lg:h-80 xl:h-96 rounded-3xl shadow-sm border-secondary border-2 border-dashed cursor-pointer flex items-center justify-center"
        >
          <input {...getInputProps()} />
          <div className="space-y-4 text-foreground">
            {isHover ? (
              <>
                <div className="justify-center flex text-6xl">
                  <LuFileSymlink />
                </div>
                <h3 className="text-center font-medium text-2xl">
                  Yes, right there
                </h3>
              </>
            ) : (
              <>
                <div className="justify-center flex text-6xl">
                  <FiUploadCloud />
                </div>
                <h3 className="text-center font-medium text-2xl">
                  Click, or drop your files here
                </h3>
              </>
            )}
          </div>
        </div>
      )}
    </ReactDropzone>
  );
}
