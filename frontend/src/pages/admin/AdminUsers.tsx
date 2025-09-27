



// src/pages/admin/AdminUsers.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box, Typography, Button, Stack, TextField, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControlLabel, Switch, Tooltip, Chip, MenuItem, Select, InputLabel, FormControl
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SecurityIcon from "@mui/icons-material/Security";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSnackbar } from "notistack"; // nếu chưa dùng, thay bằng alert

import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  enableUser,
  setRoles,
  type UserResponse,
  type Role,
} from "../../features/admin/adminApi";

/* ---------------- Dialog: Tạo user ---------------- */
function CreateUserDialog(props: {
  open: boolean;
  onClose: () => void;
  onCreated: (u: UserResponse) => void;
}) {
  const { open, onClose, onCreated } = props;
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [roles, setRolesState] = useState<Role[]>(["USER"]);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setEmail(""); setFullName(""); setPassword(""); setEnabled(true); setRolesState(["USER"]);
  };

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const u = await createUser({ email, fullName, password, enabled, roles });
      onCreated(u);
      reset();
      onClose();
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || e.message || "Create failed";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create User</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <TextField label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <TextField label="Full name" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
          <TextField type="password" label="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <FormControlLabel control={
            <Switch checked={enabled} onChange={(e)=>setEnabled(e.target.checked)} />
          } label="Enabled" />
          <FormControl size="small">
            <InputLabel id="roles-label">Roles</InputLabel>
            <Select
              labelId="roles-label"
              label="Roles"
              multiple
              value={roles}
              onChange={(e) => setRolesState(e.target.value as Role[])}
              renderValue={(val) => (val as Role[]).join(", ")}
            >
              <MenuItem value="USER">USER</MenuItem>
              <MenuItem value="ORGANIZER">ORGANIZER</MenuItem>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={submitting || !email || !fullName || !password}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------------- Dialog: Sửa user (name + enabled) ---------------- */
function EditUserDialog(props: {
  open: boolean;
  user?: UserResponse | null;
  onClose: () => void;
  onUpdated: (u: UserResponse) => void;
}) {
  const { open, user, onClose, onUpdated } = props;
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [enabled, setEnabled] = useState<boolean>(user?.enabled ?? true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setEnabled(user?.enabled ?? true);
  }, [user]);

  const onSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const u = await updateUser(user.id, { fullName, enabled });
      onUpdated(u);
      onClose();
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || e.message || "Update failed";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <TextField label="Email" value={user?.email ?? ""} disabled />
          <TextField label="Full name" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
          <FormControlLabel control={
            <Switch checked={enabled} onChange={(e)=>setEnabled(e.target.checked)} />
          } label="Enabled" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitting || !user}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------------- Dialog: Gán roles ---------------- */
function RolesDialog(props: {
  open: boolean;
  user?: UserResponse | null;
  onClose: () => void;
  onUpdated: (u: UserResponse) => void;
}) {
  const { open, user, onClose, onUpdated } = props;
  const [roles, setRolesState] = useState<Role[]>(user?.roles ?? []);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setRolesState(user?.roles ?? []);
  }, [user]);

  const onSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const finalRoles = roles.length ? roles : (["USER"] as Role[]);
      const u = await setRoles(user.id, finalRoles);
      onUpdated(u);
      onClose();
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || e.message || "Set roles failed";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Set Roles</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="roles2-label">Roles</InputLabel>
          <Select
            labelId="roles2-label"
            label="Roles"
            multiple
            value={roles}
            onChange={(e) => setRolesState(e.target.value as Role[])}
            renderValue={(val) => (val as Role[]).join(", ")}
          >
            <MenuItem value="USER">USER</MenuItem>
            <MenuItem value="ORGANIZER">ORGANIZER</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitting || !user}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------------- Trang AdminUsers ---------------- */
export default function AdminUsers() {
  const { enqueueSnackbar } = useSnackbar();
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");

  const [rows, setRows] = useState<UserResponse[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [selected, setSelected] = useState<UserResponse | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listUsers({
        q,
        role: roleFilter === "ALL" ? undefined : roleFilter,
        page: paginationModel.page,
        size: paginationModel.pageSize,
      });
      const content = Array.isArray(res?.content) ? res.content : [];
      setRows(content);
      setRowCount(Number(res?.totalElements || 0));
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || e.message || "Load failed";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [q, roleFilter, paginationModel.page, paginationModel.pageSize, enqueueSnackbar]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onCreated = () => { fetchData(); enqueueSnackbar("User created", { variant: "success" }); };
  const onUpdated = (u: UserResponse) => {
    setRows((prev) => prev.map((r) => (r.id === u.id ? u : r)));
    enqueueSnackbar("Updated", { variant: "success" });
  };

  const doDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      fetchData();
      enqueueSnackbar("Deleted", { variant: "success" });
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || e.message || "Delete failed";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  const doEnable = async (id: number, enabled: boolean) => {
    try {
      const u = await enableUser(id, enabled);
      onUpdated(u);
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || e.message || "Enable/Disable failed";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  const columns: GridColDef<UserResponse>[] = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 80 },
      { field: "email", headerName: "Email", flex: 1, minWidth: 220 },
      { field: "fullName", headerName: "Full Name", flex: 1, minWidth: 180 },
      {
        field: "enabled",
        headerName: "Enabled",
        width: 120,
        renderCell: (params) => (
          <FormControlLabel
            sx={{ ml: 0 }}
            control={
              <Switch
                size="small"
                checked={params.row.enabled}
                onChange={(e) => doEnable(params.row.id, e.target.checked)}
              />
            }
            label=""
          />
        ),
        sortable: false,
        filterable: false,
      },
      {
        field: "roles",
        headerName: "Roles",
        width: 220,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            {(params.row.roles || []).map((r) => (
              <Chip key={r} size="small" label={r} />
            ))}
          </Stack>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 220,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const row = params.row;
          return (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => { setSelected(row); setEditOpen(true); }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Set roles">
                <IconButton size="small" onClick={() => { setSelected(row); setRolesOpen(true); }}>
                  <SecurityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={() => doDelete(row.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    []
  );

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Users</Typography>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={() => fetchData()} title="Refresh"><RefreshIcon /></IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Create User
          </Button>
        </Stack>
      </Stack>

      {/* Tìm kiếm + Lọc role */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <TextField
          size="small"
          label="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") setPaginationModel((p) => ({ ...p, page: 0 })) }}
          sx={{ width: { xs: "100%", sm: 300 } }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="role-filter-label">Role filter</InputLabel>
          <Select
            labelId="role-filter-label"
            label="Role filter"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value as any); setPaginationModel((p) => ({ ...p, page: 0 })); }}
          >
            <MenuItem value="ALL">ALL</MenuItem>
            <MenuItem value="USER">USER</MenuItem>
            <MenuItem value="ORGANIZER">ORGANIZER</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={() => setPaginationModel((p) => ({ ...p, page: 0 }))}>
          Apply
        </Button>
      </Stack>

      {/* DataGrid */}
      <div style={{ height: 560, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={rowCount}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
        />
      </div>

      {/* Dialogs */}
      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={onCreated}
      />

      <EditUserDialog
        open={editOpen}
        user={selected}
        onClose={() => setEditOpen(false)}
        onUpdated={onUpdated}
      />

      <RolesDialog
        open={rolesOpen}
        user={selected}
        onClose={() => setRolesOpen(false)}
        onUpdated={onUpdated}
      />
    </Box>
  );
}
