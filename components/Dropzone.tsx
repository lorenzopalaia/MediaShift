"use client";

import { FiUploadCloud } from "react-icons/fi";
import { LuFileSymlink } from "react-icons/lu";
import { MdClose, MdDone } from "react-icons/md";
import { BiError } from "react-icons/bi";
import { HiOutlineDownload } from "react-icons/hi";
import { ImSpinner3 } from "react-icons/im";
import { FaPlus } from "react-icons/fa6";

import ReactDropzone from "react-dropzone";

import { FFmpeg } from "@ffmpeg/ffmpeg";

import { bytesToSize, fileToIcon, compressFileName } from "@/utils/fileUtils";
import { loadFfmpeg, convertFile, downloadFile } from "@/utils/ffmpegUtils";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import useSound from "use-sound";

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
import { extensions } from "@/utils/extensions";

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
  const [play] = useSound("/sounds/completedFx.mp3");

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
        downloadFile(action);
      }
    }
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
          const { url, output, size } = await convertFile(
            ffmpegRef.current,
            action,
          );
          tmpActions = tmpActions.map((elt) =>
            elt === action
              ? {
                  ...elt,
                  isConverted: true,
                  isConverting: false,
                  url,
                  output,
                  outputFileSize: size,
                }
              : elt,
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
            : elt,
        );
        setActions(tmpActions);
      }
    }
    setIsDone(true);
    setIsConverting(false);
    play();
  };

  const handleUpload = (data: File[]): void => {
    handleExitHover();
    const newFiles = data.filter(
      (file) => !files.some((existingFile) => existingFile.name === file.name),
    );
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    const tmp: Action[] = newFiles.map((file: File) => ({
      fileName: file.name,
      fileSize: file.size,
      from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
      to: null,
      fileType: file.type,
      file,
      isConverted: false,
      isConverting: false,
      isError: false,
    }));
    setActions((prevActions) => [...prevActions, ...tmp]);
  };

  const handleHover = (): void => setIsHover(true);
  const handleExitHover = (): void => setIsHover(false);

  const updateAction = (fileName: string, to: string) => {
    setActions(
      actions.map((action): Action => {
        if (action.fileName === fileName) {
          return {
            ...action,
            to,
          };
        }
        return action;
      }),
    );
  };

  const deleteAction = (action: Action): void => {
    setActions(actions.filter((elt) => elt !== action));
    setFiles(files.filter((elt) => elt.name !== action.fileName));
  };

  useEffect(() => {
    const checkIsReady = (): void => {
      let tmpIsReady = true;
      actions.forEach((action: Action) => {
        if (!action.to) tmpIsReady = false;
      });
      setIsReady(tmpIsReady);
    };

    if (!actions.length) {
      setIsDone(false);
      setFiles([]);
      setIsReady(false);
      setIsConverting(false);
    } else {
      checkIsReady();
    }
  }, [actions]);

  useEffect(() => {
    const load = async () => {
      const ffmpegResponse: FFmpeg = await loadFfmpeg();
      ffmpegRef.current = ffmpegResponse;
      setIsLoaded(true);
    };

    load();
  }, []);

  if (actions.length) {
    return (
      <div className="space-y-6">
        {actions.map((action: Action, i: number) => (
          <div
            key={i}
            className="relative flex h-fit w-full cursor-pointer flex-wrap items-center justify-between space-y-2 rounded-xl border border-muted-foreground bg-primary/5 px-4 py-4 backdrop-blur-xl lg:h-20 lg:flex-nowrap lg:px-10 lg:py-0"
          >
            {!isLoaded && (
              <Skeleton className="absolute -ml-10 h-full w-full cursor-progress rounded-xl" />
            )}
            <div className="flex items-center gap-4">
              <span className="text-2xl text-orange-600">
                {fileToIcon(action.fileType)}
              </span>
              <div className="flex w-96 items-center gap-1">
                <span className="text-md overflow-x-hidden font-medium">
                  {compressFileName(
                    action.isConverted
                      ? (action.output ?? "")
                      : action.fileName,
                  )}
                </span>
                <span className="text-sm text-muted-foreground">
                  (
                  {bytesToSize(
                    action.isConverted && action.outputFileSize !== undefined
                      ? action.outputFileSize
                      : action.fileSize,
                  )}
                  )
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
              <div className="text-md flex items-center gap-4 text-muted-foreground">
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
                  <SelectTrigger className="text-md w-32 bg-background text-center font-medium text-muted-foreground outline-none focus:outline-none focus:ring-0">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                  <SelectContent className="h-fit">
                    {action.fileType.includes("image") && (
                      <div className="grid w-fit grid-cols-2 gap-2">
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
                          <div className="grid w-fit grid-cols-3 gap-2">
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
                          <div className="grid w-fit grid-cols-3 gap-2">
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
                      <div className="grid w-fit grid-cols-2 gap-2">
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
              <Button variant="outline" onClick={() => downloadFile(action)}>
                Download
              </Button>
            ) : (
              <span
                onClick={() => deleteAction(action)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-2xl text-foreground hover:bg-muted"
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
                className="flex h-72 cursor-pointer items-center justify-center rounded-3xl border-2 border-dashed border-muted-foreground bg-primary/5 shadow-sm backdrop-blur-xl lg:h-80 xl:h-96"
              >
                <input {...getInputProps()} />
                <div className="space-y-4 text-foreground">
                  {isHover ? (
                    <>
                      <div className="flex justify-center text-6xl">
                        <LuFileSymlink />
                      </div>
                      <h3 className="text-center text-2xl font-medium">
                        Yes, right there
                      </h3>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center text-6xl">
                        <FaPlus />
                      </div>
                      <h3 className="text-center text-2xl font-medium">
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
            <div className="w-fit space-y-4">
              <Button
                size="lg"
                className="text-md relative flex w-full items-center gap-2 rounded-xl py-4 font-semibold"
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
              className="text-md relative flex w-44 items-center rounded-xl py-4 font-semibold"
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
          className="flex h-72 cursor-pointer items-center justify-center rounded-3xl border-2 border-dashed border-muted-foreground bg-primary/5 shadow-sm backdrop-blur-xl lg:h-80 xl:h-96"
        >
          <input {...getInputProps()} />
          <div className="space-y-4 text-foreground">
            {isHover ? (
              <>
                <div className="flex justify-center text-6xl">
                  <LuFileSymlink />
                </div>
                <h3 className="text-center text-2xl font-medium">
                  Yes, right there
                </h3>
              </>
            ) : (
              <>
                <div className="flex justify-center text-6xl">
                  <FiUploadCloud />
                </div>
                <h3 className="text-center text-2xl font-medium">
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
