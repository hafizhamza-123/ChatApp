export const getFileExtension = (fileName) => {
  if (!fileName) return "";
  return fileName.split(".").pop().toLowerCase();
};

export const isVideoFile = (fileName) => {
  const videoExts = ["mp4", "avi", "mov", "mkv", "flv", "wmv", "webm"];
  return videoExts.includes(getFileExtension(fileName));
};

export const isAudioFile = (fileName) => {
  const audioExts = ["mp3", "wav", "m4a", "aac", "flac", "ogg", "wma"];
  return audioExts.includes(getFileExtension(fileName));
};

export const isDocumentFile = (fileName) => {
  const docExts = ["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx"];
  return docExts.includes(getFileExtension(fileName));
};

export const getFileIcon = (fileName) => {
  const ext = getFileExtension(fileName);

  if (["doc", "docx"].includes(ext)) return "\uD83D\uDCC4";
  if (ext === "pdf") return "\uD83D\uDD34";
  if (["xls", "xlsx"].includes(ext)) return "\uD83D\uDCCA";
  if (["ppt", "pptx"].includes(ext)) return "\uD83C\uDFAC";
  if (["zip", "rar", "7z"].includes(ext)) return "\uD83D\uDCE6";

  return "\uD83D\uDCCE";
};
