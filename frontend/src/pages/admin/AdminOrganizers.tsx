

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box, Typography, Button, Stack, TextField, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControlLabel, Switch, Tooltip, Chip, CircularProgress
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import EventNoteIcon from "@mui/icons-material/EventNote";

import {
  listUsers,
  createOrganizer,
  updateUser,
  deleteUser,
  enableUser,
  setRoles,
  findUserByEmailExact,
  listAdminEvents,
  type UserResponse,
  type Role,
} from "../../features/admin/adminApi";

// --- Dialog Create Organizer mới (tạo mới tài khoản + role ORGANIZER) ---
function CreateOrganizerDialog(props: {
  open: boolean;
  onClose: () => void;
  onCreated: (u: UserResponse) => void;
}) {
  const { open, onClose, onCreated } = props;
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setEmail(""); setFullName(""); setPassword(""); setEnabled(true);
  };

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      // tạo user mới + role ORGANIZER
      const u = await createOrganizer({ email, fullName, password, enabled });
      onCreated(u);
      reset();
      onClose();
    } catch (e: any) {
      alert(e.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Organizer</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <TextField label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <TextField label="Full name" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
          <TextField type="password" label="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <FormControlLabel control={
            <Switch checked={enabled} onChange={(e)=>setEnabled(e.target.checked)} />
          } label="Enabled" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitting || !email || !fullName || !password}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// --- Dialog Edit Organizer (name + enabled) ---
function EditOrganizerDialog(props: {
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
      alert(e.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Organizer</DialogTitle>
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

type EventsMap = Record<number, { loading: boolean; items: { id: number; title: string }[] }>;

export default function AdminOrganizers() {
  const [q, setQ] = useState("");
  const [addEmail, setAddEmail] = useState(""); // thêm organizer từ user đã đăng ký (email)
  const [rows, setRows] = useState<UserResponse[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<UserResponse | null>(null);

  const [eventsMap, setEventsMap] = useState<EventsMap>({}); // organizerId -> list events (lazy fetch)

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listUsers({ role: "ORGANIZER", q, page: paginationModel.page, size: paginationModel.pageSize });
      setRows(res.content);
      setRowCount(res.totalElements);
      // khởi tạo trạng thái eventsMap
      const m: EventsMap = {};
      for (const u of res.content) {
        m[u.id] = { loading: true, items: [] };
      }
      setEventsMap(m);
      // lazy fetch events cho từng organizer (N yêu cầu nhỏ)
      for (const u of res.content) {
        try {
          const evPage = await listAdminEvents({ organizerId: u.id, page: 0, size: 10 });
          const items = (evPage.content || []).map(e => ({
            id: e.id,
            title: (e.title ?? e.name ?? `Event #${e.id}`),
          }));
          setEventsMap(prev => ({ ...prev, [u.id]: { loading: false, items } }));
        } catch {
          setEventsMap(prev => ({ ...prev, [u.id]: { loading: false, items: [] } }));
        }
      }
    } catch (e: any) {
      alert(e.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }, [q, paginationModel.page, paginationModel.pageSize]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onCreated = () => { fetchData(); };
  const onUpdated = (u: UserResponse) => {
    setRows((prev) => prev.map((r) => (r.id === u.id ? u : r)));
  };

  const doDelete = async (id: number) => {
    if (!confirm("Delete this organizer?")) return;
    try {
      await deleteUser(id);
      fetchData();
    } catch (e: any) {
      alert(e.message || "Delete failed");
    }
  };

  const toggleOrganizerRole = async (u: UserResponse, makeOrganizer: boolean) => {
    try {
      let roles: Role[] = [...(u.roles || [])];
      if (makeOrganizer) {
        if (!roles.includes("ORGANIZER")) roles.push("ORGANIZER");
      } else {
        roles = roles.filter(r => r !== "ORGANIZER");
        if (roles.length === 0) roles = ["USER"]; // đảm bảo còn ít nhất USER
      }
      const updated = await setRoles(u.id, roles);
      onUpdated(updated);
      // nếu bị gỡ, cũng nên dọn eventsMap (không bắt buộc)
      if (!makeOrganizer) {
        setEventsMap(prev => ({ ...prev, [u.id]: { loading: false, items: [] } }));
      }
    } catch (e: any) {
      alert(e.message || "Update roles failed");
    }
  };

  const doEnable = async (id: number, enabled: boolean) => {
    try {
      const u = await enableUser(id, enabled);
      onUpdated(u);
    } catch (e: any) {
      alert(e.message || "Enable/Disable failed");
    }
  };

  const promoteExistingByEmail = async () => {
    if (!addEmail) return;
    try {
      const u = await findUserByEmailExact(addEmail);
      if (!u) {
        alert("Không tìm thấy user với email này.");
        return;
      }
      if ((u.roles || []).includes("ORGANIZER")) {
        alert("User này đã là Organizer.");
        return;
      }
      const updated = await setRoles(u.id, Array.from(new Set([...(u.roles || []), "ORGANIZER" as const])));
      // nếu user không nằm trong trang hiện tại, reload toàn trang để thấy
      onUpdated(updated);
      fetchData();
      setAddEmail("");
    } catch (e: any) {
      alert(e.message || "Promote failed");
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
        width: 180,
        valueGetter: (v) => (v?.row?.roles || []).join(", "),
        renderCell: (params) => {
          const isOrg = (params.row.roles || []).includes("ORGANIZER");
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="small" label={isOrg ? "ORGANIZER" : "USER"} color={isOrg ? "primary" : "default"} />
              <Switch
                size="small"
                checked={isOrg}
                onChange={(e) => toggleOrganizerRole(params.row, e.target.checked)}
                inputProps={{ "aria-label": "Toggle organizer role" }}
              />
            </Stack>
          );
        },
        sortable: false,
        filterable: false,
      },
      {
        field: "events",
        headerName: "Events",
        flex: 1,
        minWidth: 240,
        renderCell: (params) => {
          const evState = eventsMap[params.row.id];
          if (!evState) return null;
          const count = evState.items.length;
          const listText = evState.items.map((e) => `#${e.id} ${e.title}`).join("\n");
          return evState.loading ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">Loading…</Typography>
            </Stack>
          ) : (
            <Tooltip title={count ? listText : "No events"} placement="top" arrow>
              <Stack direction="row" spacing={1} alignItems="center">
                <EventNoteIcon fontSize="small" />
                <Typography variant="body2">{count} event{count !== 1 ? "s" : ""}</Typography>
              </Stack>
            </Tooltip>
          );
        },
        sortable: false,
        filterable: false,
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 260,
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
              <Tooltip title="Promote to Admin">
                <IconButton size="small" onClick={() => {
                  const roles = Array.from(new Set([...(row.roles || []), "ADMIN" as const]));
                  setRoles(row.id, roles).then(onUpdated).catch(e => alert(e.message || "Promote failed"));
                }}>
                  <PublishedWithChangesIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove Organizer role">
                <IconButton size="small" color="warning" onClick={() => toggleOrganizerRole(row, false)}>
                  <PersonOffIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete account">
                <IconButton size="small" color="error" onClick={() => doDelete(row.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [eventsMap]
  );

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Organizers</Typography>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={() => fetchData()} title="Refresh"><RefreshIcon /></IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Create New
          </Button>
        </Stack>
      </Stack>

      {/* Tìm kiếm & Thêm từ email đã đăng ký */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <TextField
          size="small"
          label="Search organizers"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") setPaginationModel((p) => ({ ...p, page: 0 })) }}
        />
        <Button variant="outlined" onClick={() => setPaginationModel((p) => ({ ...p, page: 0 }))}>
          Apply
        </Button>

        <Stack direction="row" spacing={1} sx={{ ml: { xs: 0, sm: "auto" } }}>
          <TextField
            size="small"
            label="Add by email"
            placeholder="user@example.com"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") promoteExistingByEmail(); }}
          />
          <Button variant="contained" onClick={promoteExistingByEmail}>
            Promote
          </Button>
        </Stack>
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
      <CreateOrganizerDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={onCreated}
      />

      <EditOrganizerDialog
        open={editOpen}
        user={selected}
        onClose={() => setEditOpen(false)}
        onUpdated={onUpdated}
      />
    </Box>
  );
}

