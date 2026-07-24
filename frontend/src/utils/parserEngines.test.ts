import assert from 'node:assert/strict'
import test from 'node:test'
import type { ParserEngineInfo } from '@/api/system'
import {
  completeParserEngineRules,
  getSupportedParserFileTypes,
  getUnroutableParserFileTypes,
  resolveParserEngineForFileType,
} from './parserEngines'

const engines: ParserEngineInfo[] = [
  {
    Name: 'builtin',
    Description: 'Built in',
    FileTypes: ['pdf', 'docx'],
    Available: true,
  },
  {
    Name: 'markitdown',
    Description: 'MarkItDown',
    FileTypes: ['ppt', 'pptx', 'pdf'],
    Available: true,
  },
  {
    Name: 'mineru',
    Description: 'MinerU',
    FileTypes: ['ppt', 'pptx', 'pdf'],
    Available: false,
  },
]

test('does not report PPT/PPTX support before engines are loaded', () => {
  assert.deepEqual([...getSupportedParserFileTypes([])], [])
})

test('reports PPT/PPTX support when an available engine can route them', () => {
  const supported = getSupportedParserFileTypes(engines)
  assert.equal(supported.has('ppt'), true)
  assert.equal(supported.has('pptx'), true)
})

test('generates an explicit PPT/PPTX route for the upload batch', () => {
  const rules = completeParserEngineRules(['ppt', 'pptx'], engines)
  assert.deepEqual(rules, [{
    file_types: ['ppt', 'pptx'],
    engine: 'markitdown',
  }])
})

test('keeps an unavailable explicit engine authoritative', () => {
  const rules = [{ file_types: ['pptx'], engine: 'mineru' }]
  assert.equal(resolveParserEngineForFileType('pptx', engines, rules), undefined)
  assert.deepEqual(getUnroutableParserFileTypes(['pptx'], engines, rules), ['pptx'])
  assert.deepEqual(completeParserEngineRules(['pptx'], engines, rules), rules)
})

test('requires the explicitly selected engine to support the extension', () => {
  const rules = [{ file_types: ['pptx'], engine: 'builtin' }]
  assert.equal(resolveParserEngineForFileType('pptx', engines, rules), undefined)
})
