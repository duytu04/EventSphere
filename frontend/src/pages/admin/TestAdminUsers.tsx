import React, { useState } from 'react';
import { Button, Box, Typography, Stack } from '@mui/material';
import { listUsers, createUser, updateUser, deleteUser, enableUser, setRoles } from '../../features/admin/adminApi';
import TestQuill from '../../components/common/TestQuill';
import SimpleQuill from '../../components/common/SimpleQuill';

export default function TestAdminUsers() {
  const [result, setResult] = useState<string>('');
  const [testDescription, setTestDescription] = useState<string>('');

  const testListUsers = async () => {
    try {
      const users = await listUsers({ page: 0, size: 10 });
      setResult(JSON.stringify(users, null, 2));
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const testCreateUser = async () => {
    try {
      const user = await createUser({
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
        enabled: true,
        roles: ['USER']
      });
      setResult(JSON.stringify(user, null, 2));
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const testLogin = async () => {
    try {
      const response = await fetch('http://localhost:6868/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@eventsphere.com',
          password: 'admin123'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.token);
        setResult('Login successful! Token saved.');
      } else {
        const error = await response.text();
        setResult(`Login failed: ${error}`);
      }
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Test Admin Users API</Typography>
      
      <Stack spacing={2} mb={3}>
        <Button variant="contained" onClick={testLogin}>
          Login as Admin
        </Button>
        <Button variant="outlined" onClick={testListUsers}>
          Test List Users
        </Button>
        <Button variant="outlined" onClick={testCreateUser}>
          Test Create User
        </Button>
      </Stack>

      <Box>
        <Typography variant="h6">Result:</Typography>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '400px'
        }}>
          {result}
        </pre>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Rich Text Editor Test</Typography>
        <TestQuill />
      </Box>

      <Box sx={{ mt: 4 }}>
        <SimpleQuill />
      </Box>
    </Box>
  );
}
