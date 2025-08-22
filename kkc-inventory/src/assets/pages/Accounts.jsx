import React, { useMemo, useState } from "react";
import { Box, Typography, Tabs, Tab, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, useMediaQuery } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import AddWarehouseDialog from "../components/AddWarehouseDialog";
import AddUserDialog from "../components/AddUserDialog";
import { useTheme } from "@mui/material/styles";

function a11yProps(index) {
  return {
    id: `accounts-tab-${index}`,
    "aria-controls": `accounts-tabpanel-${index}`,
  };
}

function TabPanel({ children, value, index }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`accounts-tabpanel-${index}`}
      aria-labelledby={`accounts-tab-${index}`}
      sx={{ pt: 2 }}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
}

export default function Accounts() {

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

  // Dialog/Modal state
  const [openAddWarehouse, setOpenAddWarehouse] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);

  const warehouseNames = useMemo(() => warehouses.map(w => w.name), [warehouses]);

  // Handlers
  const handleAddWarehouse = (payload) => {
    const nextId = Math.max(0, ...warehouses.map(w => w.id)) + 1;
    setWarehouses(prev => [...prev, { id: nextId, ...payload }]);
  };

  const handleAddUser = (payload) => {
    const nextId = Math.max(0, ...users.map(u => u.id)) + 1;
    setUsers(prev => [...prev, { id: nextId, ...payload }]);
  };

  const handleDeleteWarehouse = (id) => setWarehouses(prev => prev.filter(w => w.id !== id));
  const handleDeleteUser = (id) => setUsers(prev => prev.filter(u => u.id !== id));

  return (
    <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 5, mt: -6 }}>
        Account Settings
      </Typography>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2, px: 1 }}
      >
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

      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            textColor="inherit"
            indicatorColor="primary"
            sx={{ px: 2 }}
            centered
          >
            <Tab label="Warehouses" {...a11yProps(0)} sx={{ fontWeight: 600, fontSize: '1rem', textTransform: 'none' }} />
            <Tab label="Accounts / Users" {...a11yProps(1)} sx={{ fontWeight: 600, fontSize: '1rem', textTransform: 'none' }} />
          </Tabs>
        </Box>

        <TabPanel value={tab} index={0}>

          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small" aria-label="warehouses table" sx={{ textAlign: 'center' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Assigned User(s)</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {warehouses.map((w) => (
                  <TableRow key={w.id} hover>
                    <TableCell sx={{ textAlign: 'center' }}>{w.name}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{w.location}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{Array.isArray(w.assignedUsers) ? w.assignedUsers.join(", ") : w.assignedUsers}</TableCell>
                    <TableCell align="right" sx={{ textAlign: 'center' }}>
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

        <TabPanel value={tab} index={1}>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small" aria-label="users table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>User’s Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Warehouse Assigned</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ textAlign: 'center' }}>{u.fullName}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{u.location}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{u.warehouse}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{u.role}</TableCell>
                    <TableCell align="right" sx={{ textAlign: 'center' }}>
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

      {/* Dialogs */}
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
