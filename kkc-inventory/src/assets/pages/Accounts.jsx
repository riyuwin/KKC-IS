import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Tabs, Tab, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, useMediaQuery, TextField, InputAdornment, MenuItem } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";

import WarehouseDialog from "../components/WarehouseDialog";
import UserDialog from "../components/UserDialog";

import { RetrieveWarehouse, InsertWarehouse, UpdateWarehouse, DeleteWarehouse } from "../logics/admin/ManageWarehouse";
import { DeleteAccount, InsertAccount, RetrieveAccounts, UpdateAccount } from "../logics/auth/ManageAccount"; 

import SearchBar from "../components/SearchBar";
import { useNavigate } from "react-router-dom";
import { ValidateUserLoggedIn } from "../logics/auth/ValidateLogin";

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
  { id: "number", label: "No." },
  { id: "warehouse_name", label: "Name" },
  { id: "location", label: "Location" },
  /* { id: "assignedUsers", label: "Assigned User(s)" }, */
];

const USER_COLUMNS = [
  { id: "number", label: "No." },
  { id: "fullName", label: "User’s Name" },
  { id: "location", label: "Location" },
  { id: "warehouse", label: "Warehouse Assigned" },
  { id: "role", label: "Role" },
];

function Accounts() {
  // UI Variables
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [tab, setTab] = useState(0);

  // Dialog/Modal State
  const [openWarehouse, setOpenWarehouse] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [modalType, setModalType] = useState(null);

  // Dynamics Variable States
  const [warehouses, setWarehouses] = useState([]);
  const [users, setUsers] = useState([]);
  const warehouseNames = useMemo(() => warehouses.map((w) => ({ label: w.warehouse_name, value: w.warehouse_id })), [warehouses]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter Variables
  const [search, setSearch] = useState("");   
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const user = await ValidateUserLoggedIn(navigate);

      if (!user) { 
        navigate("/login");
        return;
      }

      console.log("User from session:123", user);

      if (user.role.toLowerCase() !== "admin") { 
        if (window.location.pathname !== "/") {
          navigate("/", { replace: true });
        }
      }
    };

    checkSession();
  }, [navigate]);


  // Fetcher
  useEffect(() => {
    const fetchWarehouses = async () => {
      const { data } = await RetrieveWarehouse();
      setWarehouses(data);
    };

    fetchWarehouses();

    const interval = setInterval(fetchWarehouses, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await RetrieveAccounts();
      setUsers(data);
    };

    fetchUsers();

    const interval = setInterval(fetchUsers, 2000);
    return () => clearInterval(interval);
  }, []);


  // Managers
  const handleManageWarehouse = (payload, modal_type) => {
    if (modal_type == "Add") {
      InsertWarehouse(payload);
    } else if (modal_type == "Edit") {
      UpdateWarehouse(payload);
    }
  };

  const handleManageUser = (payload, modal_type) => {
    console.log("Test Add: ", payload);
    if (modal_type == "Add") {
      InsertAccount(payload);
    } else if (modal_type == "Edit") {
      UpdateAccount(payload);
    }
  };

  const handleUserDialogOpen = (type, user = null, warehouse = null) => {
    if (type === "Edit" && warehouse) {
      setSelectedWarehouse(warehouse);
      setSelectedUser(user);
    }

    setModalType(type);
    setOpenUserDialog(true);
  };

  const handleWarehouseDialogOpen = (modal_type, warehouse = null) => {
    if (modal_type === "Edit" && warehouse) {
      setSelectedWarehouse(warehouse);
    }

    setModalType(modal_type);
    setOpenWarehouse(true);
  };

  const handleDeleteDialogWarehouse = (warehouse_id) => {
    DeleteWarehouse(warehouse_id);
  }

  const handleDeleteDialogAccount = (account_id) => {
    DeleteAccount(account_id);
  }

  // Sort State Per Tab
  // Warehouse
  const [whOrderBy, setWhOrderBy] = useState("name");
  const [whOrder, setWhOrder] = useState("asc");

  // Accounts/User
  const [userOrderBy, setUserOrderBy] = useState("fullName");
  const [userOrder, setUserOrder] = useState("asc");

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

  // Search and Sorted Dynamic ----------------------------->
  const sortedWarehouses = useMemo(
    () => stableSort(warehouses, getComparator(whOrder, whOrderBy)),
    [warehouses, whOrder, whOrderBy]
  );

  const filteredWarehouses = useMemo(() => {
    return sortedWarehouses.filter(
      (w) =>
        w.warehouse_name.toLowerCase().includes(search.toLowerCase()) ||
        w.location.toLowerCase().includes(search.toLowerCase())
    );
  }, [sortedWarehouses, search]);

  const sortedUsers = useMemo(
    () => stableSort(users, getComparator(userOrder, userOrderBy)),
    [users, userOrder, userOrderBy]
  );

  const filteredUsers = useMemo(() => {
    return sortedUsers.filter((u) => {
      const wh = warehouses.find((w) => w.warehouse_id === u.warehouse_id);

      const fullnameMatch = u.fullname.toLowerCase().includes(search.toLowerCase());
      const locationMatch = wh?.location?.toLowerCase().includes(search.toLowerCase());
      const warehouseMatch = wh?.warehouse_name?.toLowerCase().includes(search.toLowerCase());
      const roleMatch = u.role.toLowerCase().includes(search.toLowerCase());

      return fullnameMatch || locationMatch || warehouseMatch || roleMatch;
    });
  }, [sortedUsers, warehouses, search]);


  return (
    <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 5}}>
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
            onClick={() => {
              handleWarehouseDialogOpen("Add");
            }}
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
            onClick={() => {
              handleUserDialogOpen("Add");
            }}
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

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1 }} spacing={2}>
        <Stack direction="row" spacing={2}> 
          <SearchBar
            search={search}
            onSearchChange={setSearch}
          />  
        </Stack>
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
                {filteredWarehouses.map((w, index) => (
                  <TableRow key={w.id} hover>
                    <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{w.warehouse_name}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{w.location}</TableCell>
                    {/* <TableCell sx={{ textAlign: "center" }}>
                      {Array.isArray(w.assignedUsers) ? w.assignedUsers.join(", ") : w.assignedUsers}
                    </TableCell> */}
                    <TableCell align="right" sx={{ textAlign: "center" }}>
                      <IconButton size="small" color="primary" onClick={() => handleWarehouseDialogOpen("Edit", w)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteDialogWarehouse(w.warehouse_id)}>
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
                {filteredUsers.map((u, index) => {
                  const wh = warehouses.find(w => w.warehouse_id === u.warehouse_id);

                  return (
                    <TableRow key={u.id} hover>
                      <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>{u.fullname}</TableCell>
                      {(() => {
                        return wh ? (
                          <>
                            <TableCell sx={{ textAlign: "center" }}>{wh.location}</TableCell>
                            <TableCell sx={{ textAlign: "center" }}>{wh.warehouse_name}</TableCell>
                          </>
                        ) : null;
                      })()}
                      <TableCell sx={{ textAlign: "center" }}>{u.role}</TableCell>
                      <TableCell align="right" sx={{ textAlign: "center" }}>
                        <IconButton size="small" color="primary" onClick={() => handleUserDialogOpen("Edit", u, wh)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteDialogAccount(u.account_id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}

              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Dialogs/Modals */}
      <WarehouseDialog
        open={openWarehouse}
        onClose={() => setOpenWarehouse(false)}
        onSubmit={(payload) => {
          handleManageWarehouse(payload, modalType);
          setOpenWarehouse(false);
        }}
        warehouse={modalType === "Add" ? warehouseNames : selectedWarehouse}
        modal_type={modalType}
      />

      <UserDialog
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        warehouses={modalType === "Add" ? warehouseNames : warehouses}
        user={modalType === "Edit" ? selectedUser : null}
        onSubmit={(payload) => {
          handleManageUser(payload, modalType);
          setOpenUserDialog(false);
        }}
        modal_type={modalType}
      />

    </Box>
  );
}

export default Accounts;