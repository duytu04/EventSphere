import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { listUsers, createUser, updateUser, deleteUser, setUserEnabled, setUserRoles, type UserResponse, type Role } from '../../features/admin/adminApi';

export default function AdminUsersManagement() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    enabled: true,
    roles: [] as Role[],
  });

  useEffect(() => {
    loadUsers();
  }, [searchQuery, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listUsers({
        q: searchQuery || undefined,
        role: roleFilter || undefined,
        page: 0,
        size: 100,
      });
      setUsers(response.content || []);
    } catch (err) {
      setError('Failed to load users');
      enqueueSnackbar('Failed to load users', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUser(formData);
      enqueueSnackbar('User created successfully', { variant: 'success' });
      setOpenDialog(false);
      resetForm();
      loadUsers();
    } catch (err) {
      enqueueSnackbar('Failed to create user', { variant: 'error' });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      await updateUser(editingUser.id, {
        fullName: formData.fullName,
        enabled: formData.enabled,
        roles: formData.roles,
      });
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      setOpenDialog(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (err) {
      enqueueSnackbar('Failed to update user', { variant: 'error' });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUser(userId);
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
      loadUsers();
    } catch (err) {
      enqueueSnackbar('Failed to delete user', { variant: 'error' });
    }
  };

  const handleToggleEnabled = async (userId: number, enabled: boolean) => {
    try {
      await setUserEnabled(userId, enabled);
      enqueueSnackbar(`User ${enabled ? 'enabled' : 'disabled'} successfully`, { variant: 'success' });
      loadUsers();
    } catch (err) {
      enqueueSnackbar('Failed to update user status', { variant: 'error' });
    }
  };

  const handleRoleChange = async (userId: number, roles: Role[]) => {
    try {
      await setUserRoles(userId, roles);
      enqueueSnackbar('User roles updated successfully', { variant: 'success' });
      loadUsers();
    } catch (err) {
      enqueueSnackbar('Failed to update user roles', { variant: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      password: '',
      enabled: true,
      roles: [],
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingUser(null);
    setOpenDialog(true);
  };

  const openEditDialog = (user: UserResponse) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      password: '',
      enabled: user.enabled,
      roles: user.roles,
    });
    setOpenDialog(true);
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'ORGANIZER': return 'warning';
      case 'USER': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, roles, and permissions
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search users"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Role</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as Role | '')}
                  label="Filter by Role"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="ORGANIZER">Organizer</MenuItem>
                  <MenuItem value="USER">User</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadUsers}
                fullWidth
              >
                Refresh
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateDialog}
                fullWidth
              >
                Add User
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {user.fullName || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {user.roles.map((role) => (
                        <Chip
                          key={role}
                          label={role}
                          color={getRoleColor(role) as any}
                          size="small"
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.enabled}
                      onChange={(e) => handleToggleEnabled(user.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(user.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!editingUser}
              required
            />
            <TextField
              fullWidth
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            {!editingUser && (
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            )}
            <FormControl fullWidth>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={formData.roles}
                onChange={(e) => setFormData({ ...formData, roles: e.target.value as Role[] })}
                label="Roles"
              >
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="ORGANIZER">Organizer</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            <Box display="flex" alignItems="center">
              <Switch
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Enabled
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={editingUser ? handleUpdateUser : handleCreateUser}
            variant="contained"
          >
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
}

