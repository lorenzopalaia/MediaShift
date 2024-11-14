export type Action = {
  file: File;
  fileName: string;
  fileSize: number;
  from: string;
  to: string | null;
  fileType: string;
  isConverting: boolean;
  isConverted: boolean;
  isError: boolean;
  url?: string;
  output?: string;
  outputFileSize?: number;
};
