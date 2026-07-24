import type { ParserEngineInfo } from '@/api/system'

export interface ParserEngineRule {
  file_types: string[]
  engine: string
}

function normalizeFileType(fileType: string): string {
  return fileType.trim().toLowerCase().replace(/^\./, '')
}

function supportsFileType(engine: ParserEngineInfo, fileType: string): boolean {
  const normalized = normalizeFileType(fileType)
  return (engine.FileTypes || []).some(candidate => normalizeFileType(candidate) === normalized)
}

function findExplicitEngine(fileType: string, rules: ParserEngineRule[]): string {
  const normalized = normalizeFileType(fileType)
  for (const rule of rules) {
    if (rule.file_types.some(candidate => normalizeFileType(candidate) === normalized)) {
      return rule.engine.trim()
    }
  }
  return ''
}

/**
 * Resolves the parser route the UI can actually submit for a file type.
 * An explicit rule is authoritative: an unavailable or incompatible selected
 * engine must not silently fall back to another engine.
 */
export function resolveParserEngineForFileType(
  fileType: string,
  engines: ParserEngineInfo[],
  rules: ParserEngineRule[] = [],
): ParserEngineInfo | undefined {
  const normalized = normalizeFileType(fileType)
  if (!normalized) return undefined

  const explicitEngine = findExplicitEngine(normalized, rules)
  if (explicitEngine) {
    return engines.find(engine =>
      engine.Name === explicitEngine &&
      engine.Available !== false &&
      supportsFileType(engine, normalized),
    )
  }

  return engines.find(engine =>
    engine.Available !== false && supportsFileType(engine, normalized),
  )
}

export function getSupportedParserFileTypes(
  engines: ParserEngineInfo[],
  rules: ParserEngineRule[] = [],
): Set<string> {
  const allTypes = new Set<string>()
  for (const engine of engines) {
    for (const fileType of engine.FileTypes || []) {
      const normalized = normalizeFileType(fileType)
      if (normalized) allTypes.add(normalized)
    }
  }

  return new Set(
    [...allTypes].filter(fileType =>
      resolveParserEngineForFileType(fileType, engines, rules) !== undefined,
    ),
  )
}

export function getUnroutableParserFileTypes(
  fileTypes: string[],
  engines: ParserEngineInfo[],
  rules: ParserEngineRule[] = [],
): string[] {
  const unique = new Set(fileTypes.map(normalizeFileType).filter(Boolean))
  return [...unique].filter(fileType =>
    resolveParserEngineForFileType(fileType, engines, rules) === undefined,
  )
}

/**
 * Adds explicit rules for currently unconfigured file types. Existing rules
 * are preserved, including invalid explicit selections, so configuration
 * mistakes remain visible instead of being silently replaced.
 */
export function completeParserEngineRules(
  fileTypes: string[],
  engines: ParserEngineInfo[],
  rules: ParserEngineRule[] = [],
): ParserEngineRule[] {
  const completed = rules.map(rule => ({
    file_types: [...rule.file_types],
    engine: rule.engine,
  }))
  const configured = new Set(
    completed.flatMap(rule => rule.file_types.map(normalizeFileType).filter(Boolean)),
  )
  const uniqueTypes = new Set(fileTypes.map(normalizeFileType).filter(Boolean))

  for (const fileType of uniqueTypes) {
    if (configured.has(fileType)) continue

    const engine = resolveParserEngineForFileType(fileType, engines)
    if (!engine) continue

    const sameEngineRule = completed.find(rule => rule.engine === engine.Name)
    if (sameEngineRule) {
      sameEngineRule.file_types.push(fileType)
    } else {
      completed.push({ file_types: [fileType], engine: engine.Name })
    }
    configured.add(fileType)
  }

  return completed
}
