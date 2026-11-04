import type { ReaderSettings } from '../features/reader/reader-types';

type SettingsPanelProps = {
  settings: ReaderSettings;
  onChange: (next: ReaderSettings) => void;
  onReset: () => void;
};

export function SettingsPanel({ settings, onChange, onReset }: SettingsPanelProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2>{"\u8bbe\u7f6e"}</h2>
          <p className="panel__subtext">{"\u53ef\u4ee5\u7acb\u5373\u751f\u6548\u3002"}</p>
        </div>
        <button type="button" onClick={onReset}>
          {"\u6062\u590d\u9ed8\u8ba4"}
        </button>
      </div>

      <div className="settings-grid">
        <label>
          <span>{"\u4e3b\u9898"}</span>
          <select
            value={settings.theme}
            onChange={(event) => onChange({ ...settings, theme: event.target.value as ReaderSettings['theme'] })}
          >
            <option value="light">{"\u6d45\u8272"}</option>
            <option value="sepia">{"\u62a4\u773c"}</option>
            <option value="dark">{"\u6df1\u8272"}</option>
          </select>
        </label>

        <label>
          <div className="setting-row">
            <span>{"\u5b57\u53f7"}</span>
            <strong>{settings.fontSize}px</strong>
          </div>
          <input
            type="range"
            min={14}
            max={22}
            step={1}
            value={settings.fontSize}
            onChange={(event) => onChange({ ...settings, fontSize: Number(event.target.value) })}
          />
        </label>

        <label>
          <div className="setting-row">
            <span>{"\u884c\u9ad8"}</span>
            <strong>{settings.lineHeight.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min={1.4}
            max={2.1}
            step={0.05}
            value={settings.lineHeight}
            onChange={(event) => onChange({ ...settings, lineHeight: Number(event.target.value) })}
          />
        </label>

        <label>
          <span>{"\u5185\u5bb9\u5bbd\u5ea6"}</span>
          <select
            value={settings.contentWidth}
            onChange={(event) =>
              onChange({ ...settings, contentWidth: event.target.value as ReaderSettings['contentWidth'] })
            }
          >
            <option value="narrow">{"\u7a84"}</option>
            <option value="medium">{"\u6807\u51c6"}</option>
            <option value="wide">{"\u5bbd"}</option>
          </select>
        </label>
      </div>
    </section>
  );
}
