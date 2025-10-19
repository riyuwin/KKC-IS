import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Button, Grid, Card, CardContent, CardActions, IconButton, Tooltip, Stack, CircularProgress } from "@mui/material";
import { MdAdd, MdDelete, MdDownload, MdEdit, MdVisibility, MdDescription, MdPictureAsPdf, MdInsertDriveFile } from "react-icons/md";
import dayjs from "dayjs";
import SearchBar from "../components/SearchBar";
import { PortDocuments } from "../api_ports/api";
import DocumentsCRUD, { fetchDocumentInline } from "../logics/documents/DocumentsCRUD";
import DocumentDialog from "../components/DocumentDialog";
import DocumentViewerDialog from "../components/DocumentViewerDialog";

// utils
const hasExt = (n = "") => /\.[^./\\]+$/.test(n);
const mergeNameWithExt = (display, fileName) =>
  display ? (hasExt(display) ? display : (fileName?.match(/(\.[^./\\]+)$/)?.[1] ? display + fileName.match(/(\.[^./\\]+)$/)[1] : display)) : (fileName || "document");

const pickIcon = (type = "", name = "") => {
  const s = `${type} ${name}`.toLowerCase();
  if (s.includes("pdf") || /\.(pdf)$/i.test(s))  return <MdPictureAsPdf size={28} color="#E53935" />;
  if (/\.(docx)$/i.test(s))                      return <MdDescription  size={28} color="#1565C0" />;
  if (/\.(xlsx)$/i.test(s))                      return <MdInsertDriveFile size={28} color="#2E7D32" />;
  return <MdInsertDriveFile size={28} color="#6D6D6D" />;
};


const Action = ({ title, onClick, color, children, href }) => (
  <Tooltip title={title}>
    <IconButton
      onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
      sx={{ color }}
      {...(href ? { component: "a", href, target: "_blank", rel: "noopener noreferrer", download: true } : {})}
    >
      {children}
    </IconButton>
  </Tooltip>
);

// card styles 
const cardSx = {
  borderRadius: 3,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  background: "linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)",
  boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
  "&:hover": { transform: "translateY(-5px)", boxShadow: "0 10px 20px rgba(0,0,0,0.25)" },
};

export default function Documents() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [search, setSearch] = useState("");
  const [searchNow, setSearchNow] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearchNow(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await DocumentsCRUD.fetchDocuments(searchNow);
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [searchNow]);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => a.document_name.localeCompare(b.document_name)),
    [rows]
  );

  const openViewer = async (doc) => {
    try {
      const data = await fetchDocumentInline(doc.document_id);
      setViewerDoc(data);
      setViewerOpen(true);
    } catch {
      window.open(`${PortDocuments}/${doc.document_id}/view`, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 5 }}>Documents</Typography>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5, px: 1 }} spacing={2}>
        <SearchBar search={search} onSearchChange={setSearch} placeholder="Search documents..." width={360} />
        <Button
          variant="contained"
          startIcon={<MdAdd />}
          onClick={() => setOpen(true)}
          sx={{ bgcolor: "#E67600", "&:hover": { bgcolor: "#f99f3fff" }, textTransform: "none", fontWeight: 600, borderRadius: 2 }}
        >
          Add Attachment
        </Button>
      </Stack>

      {loading ? (
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" py={4}>
          <CircularProgress size={22} />
          <Typography variant="body2">Loading…</Typography>
        </Stack>
      ) : sorted.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 3 }}>No documents found.</Typography>
      ) : (
        <Grid container spacing={4}>
          {sorted.map((doc) => {
            const title = mergeNameWithExt(doc.document_name, doc.file_name);
            return (
              <Grid key={doc.document_id} item xs={12} sm={6} md={4}>
                <Card elevation={6} onClick={() => openViewer(doc)} sx={cardSx}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                      {pickIcon(doc.file_type, doc.file_name || doc.document_name)}
                      <Typography
                        variant="subtitle1"
                        title={title}
                        sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexGrow: 1, color: "#333" }}
                      >
                        {title}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Uploaded: {doc.uploaded_at ? dayjs(doc.uploaded_at).format("MMM D, YYYY h:mm A") : "—"}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ justifyContent: "space-between", px: 3, pb: 2.5, borderTop: "1px solid rgba(0,0,0,0.05)", backgroundColor: "#fafafa" }}>
                    <Stack direction="row" spacing={1}>
                      <Action title="View" color="#2E7D32" onClick={() => openViewer(doc)}><MdVisibility /></Action>
                      <Action
                        title="Download"
                        color="#E65100"
                        href={`${PortDocuments}/${doc.document_id}/download`}
                      >
                        <MdDownload />
                      </Action>
                      <Action title="Rename" color="#1565C0" onClick={async () => {
                        const res = await DocumentsCRUD.renameWithDialog(doc);
                        if (!res?.cancelled) load();
                      }}>
                        <MdEdit />
                      </Action>
                    </Stack>
                    <Action title="Delete" onClick={async () => {
                      const res = await DocumentsCRUD.deleteDocument(doc.document_id, doc.document_name);
                      if (!res?.cancelled) load();
                    }}>
                      <MdDelete color="#D32F2F" />
                    </Action>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <DocumentDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={async (payload) => {
          const res = await DocumentsCRUD.createDocument(payload);
          if (!res?.cancelled) { setOpen(false); await load(); }
        }}
      />

      <DocumentViewerDialog open={viewerOpen} onClose={() => setViewerOpen(false)} docMeta={viewerDoc} />
    </Box>
  );
}
