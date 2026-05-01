"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";

type JsonRecord = Record<string, unknown>;

type Insight = {
  message: string;
  suggestions: string[];
};

function normalizeData(input: unknown): JsonRecord[] {
  if (Array.isArray(input)) {
    return input.filter((item): item is JsonRecord => typeof item === "object" && item !== null) as JsonRecord[];
  }
  if (typeof input === "object" && input !== null) {
    const values = Object.values(input as Record<string, unknown>);
    if (values.every((value) => typeof value === "object" && value !== null)) {
      return values as JsonRecord[];
    }
  }
  return [];
}

function buildInsight(rawJson: string, parsed: JsonRecord[]): Insight | null {
  if (!rawJson.trim()) {
    return {
      message: "No JSON input found.",
      suggestions: ["Paste JSON in the editor", "or upload a .json file to continue"],
    };
  }

  try {
    const input = JSON.parse(rawJson);
    if (!parsed.length) {
      if (Array.isArray(input)) {
        return {
          message: "JSON array exists, but no object rows were found.",
          suggestions: ["Ensure each array item is an object", "Example: [{\"id\":1,\"name\":\"Ada\"}]"],
        };
      }

      return {
        message: "JSON structure is valid but not export-ready.",
        suggestions: ["Use an array of objects", "or an object where each value is an object row"],
      };
    }

    return null;
  } catch {
    const looksAlmostValid = /([{\[]).*(\]|})/s.test(rawJson);
    return {
      message: "Invalid JSON syntax.",
      suggestions: looksAlmostValid
        ? ["Check for trailing commas", "Ensure keys/strings use double quotes", "Validate JSON with a formatter"]
        : ["Start with [ ... ] for arrays", "or { ... } for objects", "Example: [{\"id\":1,\"name\":\"Ada\"}]"],
    };
  }
}

export function ConverterCard() {
  const [rawJson, setRawJson] = useState("");
  const [filename, setFilename] = useState("export.xlsx");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [rowLimit, setRowLimit] = useState<number>(0);
  const [rowOffset, setRowOffset] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const parsed = useMemo(() => {
    if (!rawJson.trim()) return [] as JsonRecord[];
    try {
      const parsedJson = JSON.parse(rawJson);
      return normalizeData(parsedJson);
    } catch {
      return [] as JsonRecord[];
    }
  }, [rawJson]);

  const insight = useMemo(() => buildInsight(rawJson, parsed), [rawJson, parsed]);

  const columns = useMemo(() => {
    const set = new Set<string>();
    parsed.forEach((row) => Object.keys(row).forEach((key) => set.add(key)));
    return Array.from(set);
  }, [parsed]);

  const activeColumns = selectedColumns.length ? selectedColumns : columns;
  const clampedOffset = Math.max(0, Math.min(rowOffset, Math.max(parsed.length - 1, 0)));
  const slicedRows = useMemo(() => {
    const start = clampedOffset;
    const end = rowLimit > 0 ? start + rowLimit : undefined;
    return parsed.slice(start, end).map((row) => {
      const shaped: JsonRecord = {};
      activeColumns.forEach((col) => {
        shaped[col] = row[col] ?? "";
      });
      return shaped;
    });
  }, [parsed, activeColumns, rowLimit, clampedOffset]);

  const handleFile = async (file: File) => {
    setProgress(15);
    const text = await file.text();
    setProgress(60);
    setRawJson(text);
    setTimeout(() => setProgress(100), 200);
    setTimeout(() => setProgress(0), 800);
  };

  const toggleColumn = (column: string) => {
    setSelectedColumns((prev) => (prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]));
  };

  const downloadXlsx = async () => {
    if (!slicedRows.length) return;

    setIsExporting(true);
    setProgress(20);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const worksheet = XLSX.utils.json_to_sheet(slicedRows);
    setProgress(55);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    setProgress(80);

    XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
    setProgress(100);
    setTimeout(() => {
      setIsExporting(false);
      setProgress(0);
    }, 400);
  };

  return (
    <section className="card">
      <div className="controls">
        <label>
          Upload .json file
          <input
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleFile(file);
              }
            }}
          />
        </label>
        <label>
          Output filename
          <input value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="export.xlsx" />
        </label>
      </div>

      <label>
        JSON input
        <textarea
          rows={12}
          value={rawJson}
          onChange={(e) => setRawJson(e.target.value)}
          placeholder='[{"id":1,"name":"Ada"},{"id":2,"name":"Grace"}]'
        />
      </label>

      {progress > 0 && (
        <div className="progressWrap" aria-live="polite">
          <div className="progressBar" style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      )}

      {columns.length > 0 && (
        <div className="panel">
          <h3>Map Columns</h3>
          <p className="muted">Select which columns to export (leave empty to export all).</p>
          <div className="chips">
            {columns.map((col) => {
              const selected = selectedColumns.includes(col);
              return (
                <button key={col} type="button" className={`chip ${selected ? "selected" : ""}`} onClick={() => toggleColumn(col)}>
                  {col}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="panel rowMap">
        <h3>Map Rows</h3>
        <div className="rowControls">
          <label>
            Start row (0-index)
            <input type="number" min={0} value={rowOffset} onChange={(e) => setRowOffset(Number(e.target.value) || 0)} />
          </label>
          <label>
            Max rows (0 = all)
            <input type="number" min={0} value={rowLimit} onChange={(e) => setRowLimit(Number(e.target.value) || 0)} />
          </label>
        </div>
      </div>

      <div className="footer">
        <div>
          <p>{parsed.length} rows detected</p>
          <p>{columns.length} columns detected</p>
          <p>{slicedRows.length} rows selected for export</p>
          {columns.length > 0 && <p className="muted">Detected: {columns.join(", ")}</p>}
          {insight && (
            <div className="errorBox">
              <p className="error">{insight.message}</p>
              <ul>
                {insight.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button onClick={() => void downloadXlsx()} disabled={!!insight || !slicedRows.length || isExporting}>
          {isExporting ? "Exporting..." : "Download XLSX"}
        </button>
      </div>
    </section>
  );
}
