import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Tabs, Tab, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, useMediaQuery } from "@mui/material";
import React, { useMemo, useState } from "react";
import {
  Box, Typography, Tabs, Tab, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Stack, useMediaQuery
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import AddWarehouseDialog from "../components/AddWarehouseDialog";
import AddUserDialog from "../components/AddUserDialog";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";
import InsertWarehouse from "../logics/auth/InsertWarehouse";
import RetrieveWarehouse from "../logics/auth/RetrieveWarehouse";
import InsertAccount from "../logics/auth/InsertAccount";
import RetrieveAccounts from "../logics/auth/RetrieveAccounts";

const a11yProps = (i) => ({ id: `accounts-tab-${i}`, "aria-controls": `accounts-tabpanel-${i}` });
const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} id={`accounts-tabpanel-${index}`} aria-labelledby={`accounts-tab-${index}`} sx={{ pt: 2 }}>
    {value === index && <Box>{children}</Box>}
  </Box>
);

// Column configs
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

const headerCellSx = {
  p: 1.5,
  fontSize: "0.95rem",
  fontWeight: 600,
  bgcolor: "#706f6fff",
  textAlign: "center",
  color: "white",
};

// Reusable outlined/shadowed table with sorting + header/body styles
function TableCard({ aria, columns, rows, order, orderBy, onSort, renderRow, emptyText }) {
  const sorted = useMemo(() => stableSort(rows, getComparator(order, orderBy)), [rows, order, orderBy]);

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        border: "1px solid #ddd",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
        bgcolor: "background.paper",
      }}
    >
      <Table size="small" aria-label={aria}>
        <TableHead
          sx={{
            "& .MuiTableCell-root": headerCellSx,
            // keep label + icon white even when active/hover
            "& .MuiTableSortLabel-root": {
              color: "white !important",
              "&:hover": { color: "white" },
              "&.Mui-active": { color: "white" },
            },
            "& .MuiTableSortLabel-icon": {
              color: "white !important",
            },
          }}
        >
          <TableRow>
            {columns.map((c) => (
              <SortableHeader key={c.id} id={c.id} label={c.label} order={order} orderBy={orderBy} onSort={onSort} />
            ))}
            <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", textAlign: "center" }} align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody
          sx={{
            "& .MuiTableCell-root": { fontSize: "0.9rem" },
          }}
        >
          {sorted.length ? (
            sorted.map(renderRow)
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>
                {emptyText}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function Accounts() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Dummy Data
  /* const [warehouses, setWarehouses] = useState([
    { id: 1, name: "Quezon Warehouse", location: "Quezon City", assignedUsers: ["Jane D.", "Mark T."] },
    { id: 2, name: "Manila Warehouse", location: "Manila", assignedUsers: ["Leo P."] },
  ]); */

  const [warehouses, setWarehouses] = useState([]);
  const [users, setUsers] = useState([]);

  /* const [users, setUsers] = useState([
  // Data
  const [warehouses, setWarehouses] = useState([
    { id: 1, name: "Quezon Warehouse", location: "Quezon City", assignedUsers: ["Jane D.", "Mark T."] },
    { id: 2, name: "Manila Warehouse", location: "Manila", assignedUsers: ["Leo P."] },
  ]);
  const [users, setUsers] = useState([
    { id: 1, fullName: "Jane Dela Cruz", location: "Quezon City", warehouse: "Quezon Warehouse", role: "Admin" },
    { id: 2, fullName: "Mark Tan", location: "Intramuros", warehouse: "Intramuros Warehouse", role: "Warehouse" },
    { id: 3, fullName: "Leo Pangan", location: "Manila", warehouse: "Manila Warehouse", role: "Warehouse" },
  ]); */

  // Tabs + dialogs/modals
  const [tab, setTab] = useState(0);
  const [openAddWarehouse, setOpenAddWarehouse] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);

  //const warehouseNames = useMemo(() => warehouses.map((w) => w.warehouse_name), [warehouses]);
  const warehouseNames = useMemo(
    () => warehouses.map((w) => ({ label: w.warehouse_name, value: w.warehouse_id })),
    [warehouses]
  );

  useEffect(() => {
      const fetchData = async () => {
          const { data } = await RetrieveWarehouse();
          console.log("Warehouse: ", data);

          setWarehouses(data);
      };

      fetchData();
  }, []);

  if (warehouses.warehouse_id == 3){
      console.log("Warehouse1: ", warehouses);
  }
    
  useEffect(() => {
      const fetchData = async () => {
          const { data } = await RetrieveAccounts();
          console.log("Accounts: ", data);

          setUsers(data);
      };

      fetchData();
  }, []);

  const warehouseNames = useMemo(() => warehouses.map((w) => w.name), [warehouses]);

  // Sort state combined (DRY)
  const [sort, setSort] = useState({
    wh: { orderBy: "name", order: "asc" },
    user: { orderBy: "fullName", order: "asc" },
  });
  const makeSortHandler = (key) => (property) =>
    setSort((s) => {
      const isAsc = s[key].orderBy === property && s[key].order === "asc";
      return { ...s, [key]: { orderBy: property, order: isAsc ? "desc" : "asc" } };
    });

  // Accounts/User
  const [userOrderBy, setUserOrderBy] = useState("fullName");
  const [userOrder, setUserOrder] = useState("asc");

  // CRUD Handlers (front-end lang 'to)
  const handleAddWarehouse = (payload) => {
    const nextId = Math.max(0, ...warehouses.map((w) => w.id)) + 1;
    //setWarehouses((prev) => [...prev, { id: nextId, ...payload }]);
    InsertWarehouse(payload.name, payload.location);
  };
  const handleAddUser = (payload) => {
    const nextId = Math.max(0, ...users.map((u) => u.id)) + 1;
    // setUsers((prev) => [...prev, { id: nextId, ...payload }]);    
    InsertAccount(payload.warehouse, payload.fullName, payload.username, payload.email, payload.password, payload.role);
  };

  // CRUD
  const addWithNextId = (list, setList) => (payload) =>
    setList((prev) => [...prev, { id: Math.max(0, ...prev.map((x) => x.id)) + 1, ...payload }]);
  const handleAddWarehouse = addWithNextId(warehouses, setWarehouses);
  const handleAddUser = addWithNextId(users, setUsers);
  const handleDeleteWarehouse = (id) => setWarehouses((prev) => prev.filter((w) => w.id !== id));
  const handleDeleteUser = (id) => setUsers((prev) => prev.filter((u) => u.id !== id));

  return (
    <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 5, mt: -6 }}>
        Account Settings
      </Typography>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, px: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {tab === 0 ? "List of Warehouses" : "List of Accounts / Users"}
        </Typography>

        {tab === 0 ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddWarehouse(true)}
            sx={{ bgcolor: "#E67600", "&:hover": { bgcolor: "#f99f3fff" }, textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            Add Warehouse
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddUser(true)}
            sx={{ bgcolor: "#FA8201", "&:hover": { bgcolor: "#E67600" }, textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            Add User
          </Button>
        )}
      </Stack>

      <Paper sx={{ borderRadius: 2, p: 2, bgcolor: "transparent", boxShadow: "none" }}>
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
                {sortedWarehouses.map((w, index) => (
                  <TableRow key={w.id} hover>
                    <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{w.warehouse_name}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{w.location}</TableCell>
                    {/* <TableCell sx={{ textAlign: "center" }}>
                      {Array.isArray(w.assignedUsers) ? w.assignedUsers.join(", ") : w.assignedUsers}
                    </TableCell> */}
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
          <TableCard
            aria="warehouses table"
            columns={WH_COLUMNS}
            rows={warehouses}
            order={sort.wh.order}
            orderBy={sort.wh.orderBy}
            onSort={makeSortHandler("wh")}
            emptyText="No warehouses yet."
            renderRow={(w) => (
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
            )}
          />
        </TabPanel>

        {/* Users */}
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
                {sortedUsers.map((u, index) => (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{u.fullname}</TableCell>
                    {(() => {
                      const wh = warehouses.find(w => w.warehouse_id === u.warehouse_id);
                      return wh ? (
                        <>
                          <TableCell sx={{ textAlign: "center" }}>{wh.location}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{wh.warehouse_name}</TableCell>
                        </>
                      ) : null;
                    })()} 
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
          <TableCard
            aria="users table"
            columns={USER_COLUMNS}
            rows={users}
            order={sort.user.order}
            orderBy={sort.user.orderBy}
            onSort={makeSortHandler("user")}
            emptyText="No users yet."
            renderRow={(u) => (
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
            )}
          />
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


export default Accounts;