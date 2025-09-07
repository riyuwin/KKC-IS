import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Typography, Box, IconButton } from "@mui/material";
import { MdUpload, MdClose } from "react-icons/md";
import Swal from "sweetalert2";

const MAX_BYTES = 500 * 1024;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const ALLOWED_EXT = new Set([".pdf", ".docx", ".xls", ".xlsx"]);

export default function DocumentDialog({ open, onClose, onSubmit }) {
  const [documentName, setDocumentName] = useState("");
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const resetState = () => {
    setDocumentName("");
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  useEffect(() => {
    if (!open) resetState();
  }, [open]);

  const showError = async (title, text) => {
    await Swal.fire({
      icon: "error",
      title,
      text,
      heightAuto: false,
      didOpen: () => {
        const c = Swal.getContainer?.();
        if (c) c.style.zIndex = "20000";
      },
    });
  };

  const handlePick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const ext = (f.name.match(/(\.[^./\\]+)$/)?.[1] || "").toLowerCase();
    if (!ALLOWED_EXT.has(ext) || !ALLOWED_MIME.has(f.type)) {
      resetState();
      return showError("Unsupported file type", "Only PDF, DOCX, XLS, and XLSX are allowed.");
    }
    if (f.size > MAX_BYTES) {
      resetState();
      return showError("File too large", "Maximum allowed size is 500KB.");
    }

    // Overwrite the document name pag nagpili ng ibang file
    setFile(f);
    setDocumentName(f.name);
  };

  const handleSubmit = async () => {
    if (!file) return;
    await onSubmit?.({ document_name: documentName.trim(), file });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pr: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Add Attachment
        <IconButton aria-label="close" onClick={onClose} size="small">
          <MdClose />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField
            label="Document Name"
            size="small"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="e.g., Supply Contract (Vendor X)"
          />
          <Box>
            <Button
              component="label"
              variant="outlined"
              startIcon={<MdUpload />}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Choose File
              <input
                ref={inputRef}
                hidden
                type="file"
                accept=".pdf,.docx,.xls,.xlsx"
                onChange={handlePick}
              />
            </Button>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {file ? file.name : "No file chosen"}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ textTransform: "none", borderRadius: 2, bgcolor: "#E67600", "&:hover": { bgcolor: "#f99f3f" } }}
          disabled={!file}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}
