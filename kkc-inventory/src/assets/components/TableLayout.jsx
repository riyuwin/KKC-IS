
/* Typescripts ----------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
// Header style
export const headerCellSx = {
  py: 3.0, px: 0.75, fontSize: "0.90rem", fontWeight: 700, // bigger than rows
  bgcolor: "#706f6fff", textAlign: "center", color: "white",
};

// Body style
export const bodyCellSx = {
  textAlign: "center",
  fontSize: "0.90rem",
  py: 2,
  px: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

// Wrapping Cell Style (so that it has not ellipses)
export const wrapCellSx = {
  whiteSpace: "normal",
  wordBreak: "break-word",
  textOverflow: "clip",
  overflow: "visible",
  maxWidth: "none",
  px: 1.25,
};
/* Typescripts ----------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/