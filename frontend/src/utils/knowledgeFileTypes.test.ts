import assert from 'node:assert/strict'
import test from 'node:test'
import { isKnowledgeFileTypeAllowed } from './knowledgeFileTypes'

test('rejects PPTX when the loaded dynamic whitelist is explicitly empty', () => {
  assert.equal(isKnowledgeFileTypeAllowed('slides.pptx', []), false)
  assert.equal(isKnowledgeFileTypeAllowed('slides.pptx', new Set()), false)
})

test('uses the static whitelist only when no dynamic whitelist is supplied', () => {
  assert.equal(isKnowledgeFileTypeAllowed('slides.pptx'), true)
})
