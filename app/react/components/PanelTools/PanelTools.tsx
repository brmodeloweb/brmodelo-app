import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import "./styles.scss";

interface ToolsController {
  zoomIn?: { active: boolean; action: () => void };
  zoomOut?: { active: boolean; action: () => void };
  zoomNone?: { active: boolean; action: () => void };
  undo?: { active: boolean; action: () => void };
  redo?: { active: boolean; action: () => void };
  generateSQL?: { active: boolean; action: () => void };
  print?: { active: boolean; action: () => void };
  convert?: { active: boolean; action: () => void };
  setGrid?: { active: boolean; action: (showDotGrid: boolean) => void };
  setGridSize?: { active: boolean; action: (gridSize: number) => void };
  setSnaplines?: { active: boolean; action: (showSnaplines: boolean) => void };
  setPageBreaks?: { active: boolean; action: (showPageBreaks: boolean) => void };
}

interface PanelToolsProps {
  toolsController: ToolsController;
}

const PanelTools: React.FC<PanelToolsProps> = React.memo(({
  toolsController,
}) => {
  const { t } = useTranslation(["common"]);

  const [showDotGrid, setShowDotGrid] = useState(true);
  const [gridSize, setGridSize] = useState(10);
  const [showSnaplines, setShowSnaplines] = useState(true);
  const [showPageBreaks, setShowPageBreaks] = useState(true);
  const [editorOptionsOpen, setEditorOptionsOpen] = useState(false);

  const handleZoomIn = useCallback(() => {
    toolsController.zoomIn?.action();
  }, [toolsController]);

  const handleZoomOut = useCallback(() => {
    toolsController.zoomOut?.action();
  }, [toolsController]);

  const handleZoomNone = useCallback(() => {
    toolsController.zoomNone?.action();
  }, [toolsController]);

  const handleUndo = useCallback(() => {
    toolsController.undo?.action();
  }, [toolsController]);

  const handleRedo = useCallback(() => {
    toolsController.redo?.action();
  }, [toolsController]);

  const handleGenerateSQL = useCallback(() => {
    toolsController.generateSQL?.action();
  }, [toolsController]);

  const handlePrint = useCallback(() => {
    toolsController.print?.action();
  }, [toolsController]);

  const handleConvert = useCallback(() => {
    toolsController.convert?.action();
  }, [toolsController]);

  const handleSetGrid = useCallback((value: boolean) => {
    setShowDotGrid(value);
    toolsController.setGrid?.action(value);
  }, [toolsController]);

  const handleSetGridSize = useCallback((value: number) => {
    setGridSize(value);
    toolsController.setGridSize?.action(value);
  }, [toolsController]);

  const handleSetSnaplines = useCallback((value: boolean) => {
    setShowSnaplines(value);
    toolsController.setSnaplines?.action(value);
  }, [toolsController]);

  const handleSetPageBreaks = useCallback((value: boolean) => {
    setShowPageBreaks(value);
    toolsController.setPageBreaks?.action(value);
  }, [toolsController]);

  const toggleEditorOptions = useCallback(() => {
    setEditorOptionsOpen(prev => !prev);
  }, []);

  return (
      <section className="panel-tools floatingPanel">
        <ul className="tool-icons">
          {toolsController.undo?.active && (
            <li>
              <a onClick={handleUndo} title={t("Undo (CTRL Z)")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                  <path fill="var(--brand-primary-30)" fillRule="evenodd" d="M10 3.75a6.25 6.25 0 1 1-5.682 3.643.625.625 0 1 0-1.136-.522A7.5 7.5 0 1 0 10 2.5v1.249Z" clipRule="evenodd"/>
                  <path fill="var(--brand-primary-30)" d="M10 5.583V.667a.313.313 0 0 0-.513-.24L6.538 2.885a.313.313 0 0 0 0 .48l2.95 2.458c.203.17.512.025.512-.24Z"/>
                </svg>
              </a>
            </li>
          )}
          {toolsController.redo?.active && (
            <li className="divider">
              <a onClick={handleRedo} title={t("Redo (CTRL SHIFT Z)")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                  <path fill="var(--brand-primary-30)" fillRule="evenodd" d="M10 3.75a6.25 6.25 0 1 0 5.682 3.643.625.625 0 0 1 1.136-.522A7.5 7.5 0 1 1 10 2.5v1.249Z" clipRule="evenodd"/>
                  <path fill="var(--brand-primary-30)" d="M10 5.583V.667c0-.265.309-.41.513-.24l2.949 2.458c.15.125.15.355 0 .48l-2.95 2.458a.313.313 0 0 1-.512-.24Z"/>
                </svg>
              </a>
            </li>
          )}
          {toolsController.zoomIn?.active && (
            <li>
              <a onClick={handleZoomIn} title={t("Zoom in (Z +)")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                  <path fill="var(--brand-primary-30)" fillRule="evenodd" d="M8.125 15a6.875 6.875 0 1 0 0-13.75 6.875 6.875 0 0 0 0 13.75Zm8.125-6.875a8.125 8.125 0 1 1-16.25 0 8.125 8.125 0 0 1 16.25 0Z" clipRule="evenodd"/>
                  <path fill="var(--brand-primary-30)" d="M12.93 14.678c.037.05.078.098.123.143l4.813 4.813a1.25 1.25 0 0 0 1.768-1.768l-4.813-4.813a1.252 1.252 0 0 0-.143-.123 8.174 8.174 0 0 1-1.748 1.748Z"/>
                  <path fill="var(--brand-primary-30)" fillRule="evenodd" d="M8.125 3.75c.345 0 .625.28.625.625V7.5h3.125a.625.625 0 1 1 0 1.25H8.75v3.125a.625.625 0 1 1-1.25 0V8.75H4.375a.625.625 0 1 1 0-1.25H7.5V4.375c0-.345.28-.625.625-.625Z" clipRule="evenodd"/>
                </svg>
              </a>
            </li>
          )}
          {toolsController.zoomNone?.active && (
            <li>
              <a onClick={handleZoomNone} title={t("Zoom 100% (Z 0)")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                  <path fill="var(--brand-primary-30)" fillRule="evenodd" d="M8.125 15a6.875 6.875 0 1 0 0-13.75 6.875 6.875 0 0 0 0 13.75Zm8.125-6.875a8.125 8.125 0 1 1-16.25 0 8.125 8.125 0 0 1 16.25 0Z" clipRule="evenodd"/>
                  <path fill="var(--brand-primary-30)" d="M12.93 14.678c.037.05.078.098.123.143l4.813 4.813a1.25 1.25 0 0 0 1.768-1.768l-4.813-4.813a1.252 1.252 0 0 0-.143-.123 8.174 8.174 0 0 1-1.748 1.748Z"/>
                </svg>
              </a>
            </li>
          )}
          {toolsController.zoomOut?.active && (
            <li className="divider">
              <a onClick={handleZoomOut} title={t("Zoom out (Z -)")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                  <path fill="var(--brand-primary-30)" fillRule="evenodd" d="M8.125 15a6.875 6.875 0 1 0 0-13.75 6.875 6.875 0 0 0 0 13.75Zm8.125-6.875a8.125 8.125 0 1 1-16.25 0 8.125 8.125 0 0 1 16.25 0Z" clipRule="evenodd"/>
                  <path fill="var(--brand-primary-30)" d="M12.93 14.678c.037.05.078.098.123.143l4.813 4.813a1.25 1.25 0 0 0 1.768-1.768l-4.813-4.813a1.252 1.252 0 0 0-.143-.123 8.174 8.174 0 0 1-1.748 1.748Z"/>
                  <path fill="var(--brand-primary-30)" fillRule="evenodd" d="M3.75 8.125c0-.345.28-.625.625-.625h7.5a.625.625 0 1 1 0 1.25h-7.5a.625.625 0 0 1-.625-.625Z" clipRule="evenodd"/>
                </svg>
              </a>
            </li>
          )}
          {toolsController.convert?.active && (
            <li>
              <a onClick={handleConvert} title={t("Convert")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path fill="var(--brand-primary-30)" fillRule="evenodd" d="M13.5 3.44a.625.625 0 0 1 .884 0l3.125 3.125a.625.625 0 0 1 0 .884l-3.125 3.125a.625.625 0 1 1-.884-.884L15.616 7.5H3.125a.625.625 0 0 1 0-1.25h12.49l-2.115-2.115a.625.625 0 0 1 0-.884ZM6.5 16.56a.625.625 0 0 1-.884 0l-3.125-3.125a.625.625 0 0 1 0-.884L5.616 9.424a.625.625 0 1 1 .884.884L4.384 12.5H16.875a.625.625 0 1 1 0 1.25H4.384l2.116 2.116a.625.625 0 0 1 0 .884Z" clipRule="evenodd"/>
                </svg>
              </a>
            </li>
          )}
          {toolsController.generateSQL?.active && (
            <li>
              <a onClick={handleGenerateSQL} title={t("Generate SQL")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                  <path fill="var(--brand-primary-30)" d="M1.667 3.333C1.667 1.493 5.396 0 10 0c4.602 0 8.333 1.492 8.333 3.333V5c0 1.841-3.73 3.333-8.333 3.333S1.667 6.841 1.667 5V3.333Z"/>
                  <path fill="var(--brand-primary-30)" d="M1.667 7.918v3.749C1.667 13.507 5.396 15 10 15c4.602 0 8.333-1.492 8.333-3.333V7.918c-.537.398-1.164.723-1.822.986C14.761 9.604 12.46 10 10 10c-2.46 0-4.762-.396-6.512-1.096-.658-.263-1.284-.588-1.821-.986Z"/>
                  <path fill="var(--brand-primary-30)" d="M18.333 14.585c-.537.398-1.164.723-1.822.986-1.75.7-4.052 1.096-6.511 1.096-2.46 0-4.762-.396-6.512-1.096-.658-.263-1.284-.588-1.821-.986v2.082C1.667 18.507 5.396 20 10 20c4.602 0 8.333-1.492 8.333-3.333v-2.082Z"/>
                </svg>
              </a>
            </li>
          )}
          {toolsController.print?.active && (
            <li className="divider">
              <a onClick={handlePrint} title={t("Print (CTRL P)")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                  <path fill="var(--brand-primary-30)" d="M3.125 10a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25Z"/>
                  <path fill="var(--brand-primary-30)" d="M6.25 1.25a2.5 2.5 0 0 0-2.5 2.5v2.5H2.5A2.5 2.5 0 0 0 0 8.75v3.75A2.5 2.5 0 0 0 2.5 15h1.25v1.25a2.5 2.5 0 0 0 2.5 2.5h7.5a2.5 2.5 0 0 0 2.5-2.5V15h1.25a2.5 2.5 0 0 0 2.5-2.5V8.75a2.5 2.5 0 0 0-2.5-2.5h-1.25v-2.5a2.5 2.5 0 0 0-2.5-2.5h-7.5ZM5 3.75c0-.69.56-1.25 1.25-1.25h7.5c.69 0 1.25.56 1.25 1.25v2.5H5v-2.5ZM6.25 10a2.5 2.5 0 0 0-2.5 2.5v1.25H2.5c-.69 0-1.25-.56-1.25-1.25V8.75c0-.69.56-1.25 1.25-1.25h15c.69 0 1.25.56 1.25 1.25v3.75c0 .69-.56 1.25-1.25 1.25h-1.25V12.5a2.5 2.5 0 0 0-2.5-2.5h-7.5ZM15 12.5v3.75c0 .69-.56 1.25-1.25 1.25h-7.5c-.69 0-1.25-.56-1.25-1.25V12.5c0-.69.56-1.25 1.25-1.25h7.5c.69 0 1.25.56 1.25 1.25Z"/>
                </svg>
              </a>
            </li>
          )}
          <li className={`submenu-trigger divider ${editorOptionsOpen ? "open" : ""}`}>
            <a title={t("Editor options")} onClick={toggleEditorOptions}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                <path fill="var(--brand-primary-30)" d="M5.225 12.196v.69a.455.455 0 0 0 .468.468.456.456 0 0 0 .468-.468V10.57a.455.455 0 0 0-.468-.468.456.456 0 0 0-.468.468v.69H4.44a.469.469 0 0 0-.337.133.445.445 0 0 0-.139.335.455.455 0 0 0 .469.469h.79Zm2.664 0h7.677a.455.455 0 0 0 .468-.468.455.455 0 0 0-.468-.469H7.889a.455.455 0 0 0-.468.468.455.455 0 0 0 .468.469Zm6.886-3.455h.784a.469.469 0 0 0 .337-.133.445.445 0 0 0 .138-.335.455.455 0 0 0-.468-.469h-.791v-.69a.455.455 0 0 0-.468-.468.456.456 0 0 0-.469.468v2.317a.455.455 0 0 0 .468.468.456.456 0 0 0 .469-.468v-.69Zm-10.341 0h7.677a.455.455 0 0 0 .468-.468.455.455 0 0 0-.468-.469H4.434a.455.455 0 0 0-.469.468.455.455 0 0 0 .469.469Zm-2.297 8.29c-.472 0-.872-.163-1.198-.49a1.63 1.63 0 0 1-.49-1.198V4.65c0-.473.164-.871.49-1.195a1.636 1.636 0 0 1 1.198-.485h15.726c.472 0 .871.163 1.198.49.326.326.489.725.489 1.198v10.695c0 .472-.163.87-.49 1.194a1.636 1.636 0 0 1-1.197.485H2.137Zm0-1.364h15.726c.08 0 .154-.034.222-.1a.308.308 0 0 0 .1-.223V4.656a.308.308 0 0 0-.1-.222.308.308 0 0 0-.222-.101H2.137a.308.308 0 0 0-.222.101.308.308 0 0 0-.1.222v10.688c0 .081.033.155.1.222a.308.308 0 0 0 .222.101Z"/>
              </svg>
            </a>
            <ul className="submenu-config floatingPanel">
              {toolsController.setSnaplines?.active && (
                <li className="snaplines-display" onClick={() => handleSetSnaplines(!showSnaplines)}>
                  <input
                    type="checkbox"
                    id="snaplines"
                    checked={showSnaplines}
                    readOnly
                  />
                  <label>Snaplines</label>
                </li>
              )}
              <li className="grid-display" onClick={() => handleSetPageBreaks(!showPageBreaks)}>
                <input
                  type="checkbox"
                  id="page-breaks-toggle"
                  checked={showPageBreaks}
                  readOnly
                />
                <label>{t("Page breaks")}</label>
              </li>
              <li className="grid-display" onClick={() => handleSetGrid(!showDotGrid)}>
                <input
                  type="checkbox"
                  id="grid-toggle"
                  checked={showDotGrid}
                  readOnly
                />
                <label>Grid</label>
              </li>
              <li className="grid-config">
                <label htmlFor="grid-size">Grid size</label>
                <div className="range-selector">
                  <input
                    type="range"
                    min="10"
                    max="25"
                    step="5"
                    id="grid-size"
                    className="form-control"
                    value={gridSize}
                    onChange={(e) => handleSetGridSize(Number(e.target.value))}
                  />
                  <output>{gridSize}</output>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </section>
  );
});

PanelTools.displayName = 'PanelTools';

export default PanelTools;