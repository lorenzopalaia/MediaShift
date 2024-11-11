export default function compressFileName(fileName: string): string {
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
        maxSubstrLength - (fileExtension ? fileExtension.length : 0) - 3
      ) +
      "..." +
      fileNameWithoutExtension.slice(-charsToKeep) +
      "." +
      fileExtension;

    return compressedFileName;
  } else return fileName.trim();
}
