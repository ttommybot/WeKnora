import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const inputField = readFileSync(new URL('./Input-field.vue', import.meta.url), 'utf8')
const settingsStore = readFileSync(new URL('../stores/settings.ts', import.meta.url), 'utf8')

test('selecting an agent leaves web search off until the user enables it', () => {
  const selectAgentStart = settingsStore.indexOf('selectAgent(agentId: string')
  const getSelectedAgentStart = settingsStore.indexOf('getSelectedAgentId()', selectAgentStart)
  const selectAgentAction = settingsStore.slice(selectAgentStart, getSelectedAgentStart)

  assert.notEqual(selectAgentStart, -1)
  assert.notEqual(getSelectedAgentStart, -1)
  assert.match(selectAgentAction, /this\.settings\.webSearchEnabled = false/)

  const handleSelectAgentStart = inputField.indexOf('const handleSelectAgent = async')
  const handleSelectAgentEnd = inputField.indexOf('const clearvalue', handleSelectAgentStart)
  const handleSelectAgent = inputField.slice(handleSelectAgentStart, handleSelectAgentEnd)

  assert.notEqual(handleSelectAgentStart, -1)
  assert.notEqual(handleSelectAgentEnd, -1)
  assert.match(handleSelectAgent, /settingsStore\.selectAgent\(agent\.id, sourceTenantId\)/)
  assert.doesNotMatch(handleSelectAgent, /agentWebSearch/)
  assert.doesNotMatch(handleSelectAgent, /settingsStore\.toggleWebSearch/)
})

test('shared agents keep a selectable path back to their source model', () => {
  assert.match(
    inputField,
    /const sharedAgentDefaultModelId = computed\(\(\) => \{[\s\S]*?settingsStore\.selectedAgentSourceTenantId[\s\S]*?availableModels\.value\.some\(model => model\.id === modelId\)/
  )
  assert.match(
    inputField,
    /const restoreSharedAgentDefaultModel = \(\) => \{[\s\S]*?selectedModelId\.value = modelId;[\s\S]*?showModelSelector\.value = false;/
  )
  assert.match(
    inputField,
    /v-if="sharedAgentDefaultModelId"[\s\S]*?@click="restoreSharedAgentDefaultModel"[\s\S]*?\$t\('input\.sharedAgentModelLabel'\)/
  )
})
