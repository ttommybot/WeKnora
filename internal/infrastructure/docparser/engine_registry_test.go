package docparser

import (
	"testing"

	"github.com/Tencent/WeKnora/internal/types"
	"github.com/stretchr/testify/require"
)

func TestGetEngineInfoBuiltinDoesNotSupportPowerPoint(t *testing.T) {
	t.Parallel()

	engine, found := GetEngineInfo("builtin", true, nil, nil)
	require.True(t, found)
	require.True(t, engine.Available)
	require.NotContains(t, engine.FileTypes, "ppt")
	require.NotContains(t, engine.FileTypes, "pptx")
}

func TestGetEngineInfoFindsRemoteOnlyEngine(t *testing.T) {
	t.Parallel()

	remote := []types.ParserEngineInfo{{
		Name:      "markitdown",
		FileTypes: []string{"ppt", "pptx"},
		Available: true,
	}}
	engine, found := GetEngineInfo("markitdown", true, nil, remote)
	require.True(t, found)
	require.Equal(t, remote[0], engine)
}
