import Editor, { loader } from '@monaco-editor/react';
import { useEffect } from 'react';
import * as monaco from 'monaco-editor/editor/editor.api';
// Register contribution services before the first editor initializes Monaco's container.
import 'monaco-editor/features/register.all';
import 'monaco-editor/languages/definitions/javascript/register';
import 'monaco-editor/language/typescript/monaco.contribution';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import TypeScriptWorker from 'monaco-editor/language/typescript/ts.worker?worker';
import { usePreferences } from '../../app/preferences';
import { editorFontDefinition, editorFontSizes } from '../../lib/typography';

self.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    return label === 'typescript' || label === 'javascript' ? new TypeScriptWorker() : new EditorWorker();
  },
};
loader.config({ monaco });

export default function CodeEditor({ code, onChange, taskId }: {
  code: string; onChange: (code: string) => void; taskId: string;
}) {
  const { editorDark, settings } = usePreferences();
  useEffect(() => {
    const remeasure = () => monaco.editor.remeasureFonts();
    document.fonts.addEventListener('loadingdone', remeasure);
    return () => document.fonts.removeEventListener('loadingdone', remeasure);
  }, []);
  return <Editor
    height="100%"
    language="javascript"
    path={`file:///solutions/${taskId}.js`}
    theme={editorDark ? 'vs-dark' : 'light'}
    value={code}
    onChange={value => onChange(value ?? '')}
    loading={<div className="notice">Загружаем редактор…</div>}
    options={{
      minimap: { enabled: false }, fontSize: editorFontSizes[settings.editorSize],
      fontFamily: editorFontDefinition(settings.editorFont).family, fontLigatures: false,
      tabSize: 2, automaticLayout: true,
      scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 18 },
      ariaLabel: 'JavaScript — решение задачи', fixedOverflowWidgets: true,
    }}
  />;
}
