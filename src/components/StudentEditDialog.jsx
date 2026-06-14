import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, Box,
  TextField, Grid, Switch, FormControlLabel, Typography, Chip, Alert, Divider,
  Table, TableBody, TableCell, TableRow, IconButton, Stack, MenuItem, Snackbar,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { api, getUploadUrl } from '../api/client';
import { formatCurrency } from '../utils/currency';
import { GENDER_OPTIONS, BLOOD_GROUP_OPTIONS } from '../constants/profileOptions';
import ConfirmDialog from './ConfirmDialog';
import DocumentViewerDialog from './DocumentViewerDialog';
import AddStudentDocumentsDialog from './AddStudentDocumentsDialog';

const normalizeGenderValue = (g) => {
  if (!g) return '';
  const map = { male: 'Male', female: 'Female', other: 'Other' };
  return map[String(g).toLowerCase()] || (GENDER_OPTIONS.includes(g) ? g : '');
};

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 2 }}>{children}</Box> : null;
}

const emptyForm = () => ({
  fullName: '', email: '', phone: '', alternatePhone: '', address: '', studentId: '',
  dateOfBirth: '', gender: '', bloodGroup: '', parentGuardianName: '', motherName: '', fatherName: '',
  emergencyContact: '',
  personalBio: '', joiningDate: '', wbShooterId: '', nraiShooterId: '', shootingCategory: '',
  preferredWeaponType: '', assignedCoach: '', shootingExperience: '', competitionLevel: '',
  isCustomFeeEnabled: false, customMonthlyFee: '', feeDiscount: 0, feeDueDay: 5, isActive: true,
});

export default function StudentEditDialog({ studentId, open, onClose }) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(emptyForm());
  const [photo, setPhoto] = useState(null);
  const [addDocsOpen, setAddDocsOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [statusConfirm, setStatusConfirm] = useState(false);
  const qc = useQueryClient();

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => (await api.get(`/students/${studentId}`)).data.data,
    enabled: !!studentId && open,
  });

  useEffect(() => {
    if (student && open) {
      setForm({
        fullName: student.fullName || '',
        email: student.user?.email || student.email || '',
        phone: student.phone || '',
        alternatePhone: student.alternatePhone || '',
        address: student.address || '',
        studentId: student.studentId || '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.slice(0, 10) : '',
        gender: normalizeGenderValue(student.gender),
        bloodGroup: student.bloodGroup || '',
        parentGuardianName: student.parentGuardianName || '',
        motherName: student.motherName || '',
        fatherName: student.fatherName || '',
        emergencyContact: student.emergencyContact || '',
        personalBio: student.personalBio || '',
        joiningDate: student.joiningDate ? student.joiningDate.slice(0, 10) : '',
        wbShooterId: student.wbShooterId || '',
        nraiShooterId: student.nraiShooterId || '',
        shootingCategory: student.shootingCategory || '',
        preferredWeaponType: student.preferredWeaponType || '',
        assignedCoach: student.assignedCoach || '',
        shootingExperience: student.shootingExperience || '',
        competitionLevel: student.competitionLevel || '',
        isCustomFeeEnabled: !!student.isCustomFeeEnabled,
        customMonthlyFee: student.customMonthlyFee ?? '',
        feeDiscount: student.feeDiscount || 0,
        feeDueDay: student.feeDueDay || 5,
        isActive: student.user?.isActive !== false,
      });
      setTab(0);
    }
  }, [student, open]);

  const save = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      if (photo) fd.append('photo', photo);
      return api.put(`/students/${studentId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: (res) => {
      qc.invalidateQueries(['students', 'student', studentId]);
      setSnack({
        open: true,
        message: res.data.message || 'Profile updated successfully',
        severity: 'success',
      });
      onClose();
    },
    onError: (err) => {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Failed to save student profile',
        severity: 'error',
      });
    },
  });

  const handleSaveClick = () => {
    if (!student) return;
    const wasActive = student.user?.isActive !== false;
    if (form.isActive !== wasActive) {
      setStatusConfirm(true);
      return;
    }
    save.mutate();
  };

  const uploadDocs = useMutation({
    mutationFn: async (pendingDocs) => {
      const fd = new FormData();
      pendingDocs.forEach((d, i) => {
        fd.append('documents', d.file);
        fd.append(`docName_${i}`, d.name);
        fd.append(`docType_${i}`, d.type);
      });
      return api.post(`/students/${studentId}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      qc.invalidateQueries(['student', studentId]);
      setAddDocsOpen(false);
      setSnack({ open: true, message: 'Documents uploaded successfully', severity: 'success' });
    },
    onError: (err) => {
      setSnack({
        open: true,
        message: err.response?.data?.message || 'Failed to upload documents',
        severity: 'error',
      });
    },
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ fontWeight: 800 }}>
        Edit Student — {student?.fullName || '...'}
        {student?.effectiveFee && (
          <Chip label={`${formatCurrency(student.effectiveFee)}/mo (${student.feeType})`} size="small" sx={{ ml: 1 }} />
        )}
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Typography>Loading profile...</Typography>
        ) : (
          <>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab label="Personal" />
              <Tab label="Shooter IDs" />
              <Tab label="Fees" />
              <Tab label="Payments" />
              <Tab label="Account" />
              <Tab label="Documents" />
            </Tabs>

            <TabPanel value={tab} index={0}>
              <Grid container spacing={2}>
                {[
                  ['fullName', 'Full Name'], ['studentId', 'Student ID'], ['email', 'Login Email'],
                  ['phone', 'Phone'], ['alternatePhone', 'Alternate Phone'],
                  ['emergencyContact', 'Emergency Contact'], ['dateOfBirth', 'Date of Birth', 'date'],
                  ['joiningDate', 'Joining Date', 'date'], ['address', 'Address'],
                ].map(([key, label, type]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <TextField fullWidth label={label} type={type || 'text'} value={form[key]} onChange={set(key)}
                      multiline={key === 'address'} rows={key === 'address' ? 2 : 1} />
                  </Grid>
                ))}
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth select label="Gender" value={form.gender} onChange={set('gender')}>
                    <MenuItem value="">
                      <em>Select gender</em>
                    </MenuItem>
                    {GENDER_OPTIONS.map((g) => (
                      <MenuItem key={g} value={g}>
                        {g}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth select label="Blood Group" value={form.bloodGroup} onChange={set('bloodGroup')}>
                    <MenuItem value="">
                      <em>Select blood group</em>
                    </MenuItem>
                    {BLOOD_GROUP_OPTIONS.map((bg) => (
                      <MenuItem key={bg} value={bg}>
                        {bg}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Parent / Guardian Name"
                    value={form.parentGuardianName}
                    onChange={set('parentGuardianName')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mother's Name"
                    value={form.motherName}
                    onChange={set('motherName')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Father's Name"
                    value={form.fatherName}
                    onChange={set('fatherName')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Personal Bio" multiline rows={3} value={form.personalBio} onChange={set('personalBio')} />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" component="label">
                    Update Photo
                    <input type="file" hidden accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
                  </Button>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <Alert severity="info" sx={{ mb: 2 }}>Only admin can edit WB & NRAI shooter IDs.</Alert>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="West Bengal Shooter ID" placeholder="WB-2026-00125"
                    value={form.wbShooterId} onChange={set('wbShooterId')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="NRAI Shooter ID" placeholder="NRAI-458721"
                    value={form.nraiShooterId} onChange={set('nraiShooterId')} />
                </Grid>
                {['shootingCategory', 'preferredWeaponType', 'assignedCoach', 'shootingExperience', 'competitionLevel'].map((k) => (
                  <Grid item xs={12} sm={6} key={k}>
                    <TextField fullWidth label={k.replace(/([A-Z])/g, ' $1')} value={form[k]} onChange={set(k)} />
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel value={tab} index={2}>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Global default: {formatCurrency(student?.paymentSettings?.defaultMonthlyFee)} · UPI: {student?.globalUPI}
              </Typography>
              <FormControlLabel
                control={<Switch checked={form.isCustomFeeEnabled} onChange={(e) => setForm({ ...form, isCustomFeeEnabled: e.target.checked })} />}
                label="Enable custom monthly fee for this student"
              />
              <Grid container spacing={2} mt={1}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth type="number" label="Custom Monthly Fee (₹)" disabled={!form.isCustomFeeEnabled}
                    value={form.customMonthlyFee} onChange={set('customMonthlyFee')} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth type="number" label="Discount (₹)" value={form.feeDiscount} onChange={set('feeDiscount')} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth type="number" label="Due Day" value={form.feeDueDay} onChange={set('feeDueDay')} />
                </Grid>
              </Grid>
              <Alert severity="success" sx={{ mt: 2 }}>
                Effective fee after save: {formatCurrency(student?.effectiveFee)} ({student?.feeType})
              </Alert>
            </TabPanel>

            <TabPanel value={tab} index={3}>
              {(student?.payments || []).length === 0 ? (
                <Typography color="text.secondary">No payment history.</Typography>
              ) : (
                <Table size="small">
                  <TableBody>
                    {student.payments.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell>{p.month} {p.year}</TableCell>
                        <TableCell>{formatCurrency(p.amount)}</TableCell>
                        <TableCell><Chip size="small" label={p.status} color={p.status === 'approved' ? 'success' : p.status === 'pending' ? 'warning' : 'error'} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabPanel>

            <TabPanel value={tab} index={4}>
              <FormControlLabel
                control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
                label={form.isActive ? 'Account Active' : 'Account Suspended'}
              />
              <Typography variant="body2" mt={2}>Last login: {student?.user?.lastLogin ? new Date(student.user.lastLogin).toLocaleString() : 'Never'}</Typography>
            </TabPanel>

            <TabPanel value={tab} index={5}>
              <Stack spacing={2}>
                <Alert severity="info" icon={false}>
                  Student documents must be <strong>PDF</strong> format and smaller than <strong>1 MB</strong> each.
                </Alert>

                {(student?.documents || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No documents uploaded yet.
                  </Typography>
                ) : (
                  (student?.documents || []).map((doc) => (
                    <Box
                      key={doc._id}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      gap={2}
                      px={1.5}
                      py={1.25}
                      border="1px solid"
                      borderColor="divider"
                      borderRadius={2}
                    >
                      <Box minWidth={0}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {doc.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doc.type}
                        </Typography>
                      </Box>
                      <Button size="small" onClick={() => setViewDoc(doc)}>
                        View
                      </Button>
                    </Box>
                  ))
                )}

                <Divider />

                <Button variant="outlined" onClick={() => setAddDocsOpen(true)}>
                  Add Documents
                </Button>
              </Stack>
            </TabPanel>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSaveClick} disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Save All Changes'}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={statusConfirm}
        title={form.isActive ? 'Activate student?' : 'Suspend student?'}
        message={
          form.isActive
            ? `Allow ${form.fullName} to sign in and use the student portal again?`
            : `Suspend ${form.fullName}? They will not be able to log in until reactivated.`
        }
        confirmLabel={form.isActive ? 'Activate' : 'Suspend'}
        confirmColor={form.isActive ? 'success' : 'warning'}
        onConfirm={() => {
          setStatusConfirm(false);
          save.mutate();
        }}
        onCancel={() => setStatusConfirm(false)}
        loading={save.isPending}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        message={snack.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{ sx: snack.severity === 'error' ? { bgcolor: 'error.main' } : { bgcolor: 'success.main' } }}
      />

      <AddStudentDocumentsDialog
        open={addDocsOpen}
        onClose={() => setAddDocsOpen(false)}
        onUpload={(pendingDocs) => uploadDocs.mutate(pendingDocs)}
        uploading={uploadDocs.isPending}
      />

      <DocumentViewerDialog
        open={!!viewDoc}
        onClose={() => setViewDoc(null)}
        title={viewDoc?.name}
        url={viewDoc ? getUploadUrl(viewDoc.file) : ''}
      />
    </Dialog>
  );
}
