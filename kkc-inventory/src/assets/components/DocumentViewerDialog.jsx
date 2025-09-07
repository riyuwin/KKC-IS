import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton, Stack } from "@mui/material";
import { MdClose } from "react-icons/md";

function hasExt(name = "") {
  return /\.[^./\\]+$/.test(name);
}
function mergeNameWithExt(display, fileName) {
  if (!display) return fileName || "document";
  if (hasExt(display)) return display;
  const match = (fileName || "").match(/(\.[^./\\]+)$/);
  return match ? `${display}${match[1]}` : display;
}

// Base64
function b64ToUint8Array(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// XLSX Styling para medyo readable ang excel dialog
const XLSX_CSS = `
  .kkc-xlsx-wrapper { width:100%; overflow:auto; }
  .kkc-xlsx-wrapper table { border-collapse: collapse; width: 100%; table-layout: fixed; }
  .kkc-xlsx-wrapper th, .kkc-xlsx-wrapper td {
    border: 1px solid #ddd; padding: 6px; vertical-align: top; word-wrap: break-word; white-space: pre-wrap;
  }
  .kkc-xlsx-wrapper thead th { background: #f6f6f6; font-weight: 700; }
`;

// Build a <colgroup> string from ws["!cols"] widths (if present)
function buildColGroup(cols = []) {
  if (!Array.isArray(cols) || cols.length === 0) return "";
  const wchToPx = (wch) => (wch ? Math.max(40, Math.round(wch * 8)) : 80); // min 40px
  const colsHtml = cols
    .map((c) => `<col style="width:${wchToPx(c?.wch)}px;">`)
    .join("");
  return `<colgroup>${colsHtml}</colgroup>`;
}

export default function DocumentViewerDialog({ open, onClose, docMeta }) {
  // docMeta: { document_name, file_name, file_type, base64 }
  const containerRef = useRef(null);
  const [error, setError] = useState("");

  const fileUrl = useMemo(() => {
    if (!docMeta?.base64 || !docMeta?.file_type) return null;
    return `data:${docMeta.file_type};base64,${docMeta.base64}`;
  }, [docMeta]);

  const title = useMemo(
    () => mergeNameWithExt(docMeta?.document_name, docMeta?.file_name),
    [docMeta]
  );

  useEffect(() => {
    setError("");
    if (!open || !docMeta) return;
    if (!containerRef.current) return;       
    containerRef.current.innerHTML = "";   

    let cancelled = false;
    const type = (docMeta.file_type || "").toLowerCase();
    const ensureAlive = () => open && !cancelled && !!containerRef.current;

    const renderDocx = async () => {
      try {
        const docx = await import("docx-preview"); // named exports
        const buf = b64ToUint8Array(docMeta.base64);
        if (!ensureAlive()) return;
        await docx.renderAsync(buf, containerRef.current, undefined, {
          className: "kkc-docx",
          inWrapper: true,
          ignoreFonts: true,
          breakPages: false,
        });
      } catch {
        if (ensureAlive()) setError("Unable to preview this DOCX.");
      }
    };

    const renderXlsx = async () => {
      try {
        const XLSXmod = await import("xlsx");
        const XLSX = XLSXmod.default || XLSXmod;
        const wb = XLSX.read(docMeta.base64, { type: "base64" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        let html = XLSX.utils.sheet_to_html(ws);

        const cols = ws["!cols"] || [];
        const colGroup = buildColGroup(cols);
        if (colGroup) {
          html = html.replace(
            /<table([^>]*)>/i,
            (m, attrs) => `<table${attrs}>${colGroup}`
          );
        }

        if (!ensureAlive()) return;
        containerRef.current.innerHTML = `
          <style>${XLSX_CSS}</style>
          <div class="kkc-xlsx-wrapper">${html}</div>
        `;
      } catch {
        if (ensureAlive()) setError("Unable to preview this spreadsheet.");
      }
    };

    const renderPdf = () => {
      if (!fileUrl) return setError("Invalid PDF.");
      containerRef.current.innerHTML =
        `<iframe src="${fileUrl}" style="width:100%;height:80vh;border:none;"></iframe>`;
    };

    const renderImage = () => {
      if (!fileUrl) return setError("Invalid image.");
      containerRef.current.innerHTML =
        `<img src="${fileUrl}" style="max-width:100%;height:auto;display:block;margin:0 auto;" />`;
    };

    const renderTextLike = () => {
      try {
        let text;
        if (type.includes("json")) {
          text = JSON.stringify(JSON.parse(atob(docMeta.base64)), null, 2);
        } else {
          text = atob(docMeta.base64);
        }
        if (!ensureAlive()) return;
        containerRef.current.textContent = text;
        containerRef.current.style.whiteSpace = "pre-wrap";
        containerRef.current.style.fontFamily = "monospace";
      } catch {
        if (ensureAlive()) setError("Unable to preview this text file.");
      }
    };

    if (type.includes("pdf")) {
      renderPdf();
    } else if (type.startsWith("image/")) {
      renderImage();
    } else if (type.includes("text/plain") || type.includes("json")) {
      renderTextLike();
    } else if (
      type.includes("officedocument.wordprocessingml.document") ||
      type === "application/msword"
    ) {
      renderDocx();
    } else if (
      type.includes("spreadsheetml.sheet") ||
      type.includes("excel") ||
      type.includes("csv")
    ) {
      renderXlsx();
    } else {
      setError("Preview not supported for this type. Please download to open.");
    }

    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [open, docMeta, fileUrl]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" keepMounted>
      <DialogTitle sx={{ fontWeight: 700, pr: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Typography component="span" variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <IconButton aria-label="close" onClick={onClose} size="small">
            <MdClose />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Box ref={containerRef} sx={{ width: "100%" }} />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
