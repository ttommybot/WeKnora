export const DEFAULT_KB_VALID_TYPES = new Set([
  'pdf', 'txt', 'md', 'docx', 'doc', 'pptx', 'ppt', 'epub', 'mhtml',
  'jpg', 'jpeg', 'png', 'csv', 'xlsx', 'xls',
  'mp3', 'wav', 'm4a', 'flac', 'ogg',
])

export function isKnowledgeFileTypeAllowed(
  fileName: string,
  validTypes?: Set<string> | string[],
): boolean {
  const allowed = validTypes === undefined
    ? DEFAULT_KB_VALID_TYPES
    : validTypes instanceof Set
      ? validTypes
      : new Set(validTypes)
  const fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
  return allowed.has(fileType)
}
