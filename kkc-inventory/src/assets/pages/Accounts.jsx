import React, { useMemo, useState } from "react";
import { Box, Typography, Tabs, Tab, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, useMediaQuery } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import AddWarehouseDialog from "../components/AddWarehouseDialog";
import AddUserDialog from "../components/AddUserDialog";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";

// A11y Helpers for Tabs
function a11yProps(index) {
  return { id: `accounts-tab-${index}`, "aria-controls": `accounts-tabpanel-${index}` };
}
function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index} id={`accounts-tabpanel-${index}`} aria-labelledby={`accounts-tab-${index}`} sx={{ pt: 2 }}>
      {value === index && <Box>{children}</Box>}
    </Box>
  );
}

// Column Configs (Labels/Header of Each Table)
const WH_COLUMNS = [
  { id: "name", label: "Name" },
  { id: "location", label: "Location" },
  { id: "assignedUsers", label: "Assigned User(s)" },
];

const USER_COLUMNS = [
  { id: "fullName", label: "User’s Name" },
  { id: "location", label: "Location" },
  { id: "warehouse", label: "Warehouse Assigned" },
  { id: "role", label: "Role" },
];

function Accounts() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Dummy Data
  const [warehouses, setWarehouses] = useState([
    { id: 1, name: "Quezon Warehouse", location: "Quezon City", assignedUsers: ["Jane D.", "Mark T."] },
    { id: 2, name: "Manila Warehouse", location: "Manila", assignedUsers: ["Leo P."] },
  ]);

  const [users, setUsers] = useState([
    { id: 1, fullName: "Jane Dela Cruz", location: "Quezon City", warehouse: "Quezon Warehouse", role: "Admin" },
    { id: 2, fullName: "Mark Tan", location: "Intramuros", warehouse: "Intramuros Warehouse", role: "Warehouse" },
    { id: 3, fullName: "Leo Pangan", location: "Manila", warehouse: "Manila Warehouse", role: "Warehouse" },
  ]);

  const [tab, setTab] = useState(0);

  // Dialog/Modal State
  const [openAddWarehouse, setOpenAddWarehouse] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);

  const warehouseNames = useMemo(() => warehouses.map((w) => w.name), [warehouses]);

  // Sort State Per Tab
  // Warehouse
  const [whOrderBy, setWhOrderBy] = useState("name");
  const [whOrder, setWhOrder] = useState("asc");

  // Accounts/User
  const [userOrderBy, setUserOrderBy] = useState("fullName");
  const [userOrder, setUserOrder] = useState("asc");

  // CRUD Handlers (front-end lang 'to)
  const handleAddWarehouse = (payload) => {
    const nextId = Math.max(0, ...warehouses.map((w) => w.id)) + 1;
    setWarehouses((prev) => [...prev, { id: nextId, ...payload }]);
  };
  const handleAddUser = (payload) => {
    const nextId = Math.max(0, ...users.map((u) => u.id)) + 1;
    setUsers((prev) => [...prev, { id: nextId, ...payload }]);
  };
  const handleDeleteWarehouse = (id) => setWarehouses((prev) => prev.filter((w) => w.id !== id));
  const handleDeleteUser = (id) => setUsers((prev) => prev.filter((u) => u.id !== id));

  // Sort handlers (tiny + generic) 
  const sortWarehouse = (property) => {
    const isAsc = whOrderBy === property && whOrder === "asc";
    setWhOrder(isAsc ? "desc" : "asc");
    setWhOrderBy(property);
  };
  const sortUser = (property) => {
    const isAsc = userOrderBy === property && userOrder === "asc";
    setUserOrder(isAsc ? "desc" : "asc");
    setUserOrderBy(property);
  };

  // Derived sorted data 
  const sortedWarehouses = useMemo(
    () => stableSort(warehouses, getComparator(whOrder, whOrderBy)),
    [warehouses, whOrder, whOrderBy]
  );
  const sortedUsers = useMemo(
    () => stableSort(users, getComparator(userOrder, userOrderBy)),
    [users, userOrder, userOrderBy]
  );

  return (
    <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 5, mt: -6 }}>
        Account Settings
      </Typography>

      {/* Header Row (Title + Add button) */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, px: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {tab === 0 ? "List of Warehouses" : "List of Accounts / Users"}
        </Typography>

        {tab === 0 ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddWarehouse(true)}
            sx={{
              bgcolor: "#E67600",
              "&:hover": { bgcolor: "#f99f3fff" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Add Warehouse
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddUser(true)}
            sx={{
              bgcolor: "#FA8201",
              "&:hover": { bgcolor: "#E67600" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Add User
          </Button>
        )}
      </Stack>

      <Paper sx={{ borderRadius: 2, p: 2 }}>
        {/* Tabs */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" indicatorColor="primary" centered>
            <Tab label="Warehouses" {...a11yProps(0)} sx={{ fontWeight: 600, fontSize: "1rem", textTransform: "none" }} />
            <Tab label="Accounts / Users" {...a11yProps(1)} sx={{ fontWeight: 600, fontSize: "1rem", textTransform: "none" }} />
          </Tabs>
        </Box>

        {/* Warehouses */}
        <TabPanel value={tab} index={0}>
          <TableContainer component={Paper}
            sx={{
              borderRadius: 2,
              border: "1px solid #ddd",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
              bgcolor: "background.paper",
            }}>
            <Table size="small" aria-label="warehouses table" sx={{ textAlign: "center" }}>
              <TableHead
                sx={{
                  "& .MuiTableCell-root": {
                    fontSize: "1.2rem",
                    fontWeight: 700,
                  },
                }}>
                <TableRow>
                  {WH_COLUMNS.map((col) => (
                    <SortableHeader
                      key={col.id}
                      id={col.id}
                      label={col.label}
                      order={whOrder}
                      orderBy={whOrderBy}
                      onSort={sortWarehouse}
                    />
                  ))}
                  <TableCell sx={{ fontWeight: 700, textAlign: "center" }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody
                sx={{
                  "& .MuiTableCell-root": {
                    fontSize: "0.95rem",
                  },
                }}>
                {sortedWarehouses.map((w) => (
                  <TableRow key={w.id} hover>
                    <TableCell sx={{ textAlign: "center" }}>{w.name}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{w.location}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {Array.isArray(w.assignedUsers) ? w.assignedUsers.join(", ") : w.assignedUsers}
                    </TableCell>
                    <TableCell align="right" sx={{ textAlign: "center" }}>
                      <IconButton size="small" color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteWarehouse(w.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {warehouses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No warehouses yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Accounts/Users */}
        <TabPanel value={tab} index={1}>
          <TableContainer component={Paper}
            sx={{
              borderRadius: 2,
              border: "1px solid #ddd",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
              bgcolor: "background.paper",
            }}>
            <Table size="small" aria-label="users table">
              <TableHead
                sx={{
                  "& .MuiTableCell-root": {
                    fontSize: "1.2rem",
                    fontWeight: 700,
                  },
                }}>
                <TableRow>
                  {USER_COLUMNS.map((col) => (
                    <SortableHeader
                      key={col.id}
                      id={col.id}
                      label={col.label}
                      order={userOrder}
                      orderBy={userOrderBy}
                      onSort={sortUser}
                    />
                  ))}
                  <TableCell sx={{ fontWeight: 700, textAlign: "center" }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody
                sx={{
                  "& .MuiTableCell-root": {
                    fontSize: "0.95rem",        // body a hair smaller than header
                  },
                }}>
                {sortedUsers.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ textAlign: "center" }}>{u.fullName}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{u.location}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{u.warehouse}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{u.role}</TableCell>
                    <TableCell align="right" sx={{ textAlign: "center" }}>
                      <IconButton size="small" color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteUser(u.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No users yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Dialogs/Modals */}
      <AddWarehouseDialog
        open={openAddWarehouse}
        onClose={() => setOpenAddWarehouse(false)}
        onSubmit={(payload) => {
          handleAddWarehouse(payload);
          setOpenAddWarehouse(false);
        }}
      />
      <AddUserDialog
        open={openAddUser}
        onClose={() => setOpenAddUser(false)}
        warehouses={warehouseNames}
        onSubmit={(payload) => {
          handleAddUser(payload);
          setOpenAddUser(false);
        }}
      />
    </Box>
  );
}

export default Accounts;