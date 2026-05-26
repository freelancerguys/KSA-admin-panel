import { Box, Card, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const defaultSx = {
  border: 'none',
  width: '100%',
  minWidth: 0,
  '& .MuiDataGrid-columnHeaders': {
    bgcolor: 'action.hover',
    fontSize: '0.8rem',
    fontWeight: 700,
  },
  '& .MuiDataGrid-cell': {
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    py: 1,
  },
  '& .MuiDataGrid-cell:focus': { outline: 'none' },
  '& .MuiDataGrid-footerContainer': {
    borderTop: '1px solid',
    borderColor: 'divider',
  },
};

export default function AdminDataGrid({
  rows = [],
  columns = [],
  loading = false,
  pageSize = 10,
  emptyMessage = 'No records found',
  minHeight = 420,
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        minWidth: 0,
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          height: { xs: 480, sm: minHeight, md: `min(${minHeight}px, calc(100vh - 240px))` },
          maxHeight: { md: 'calc(100vh - 200px)' },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          rowHeight={56}
          columnHeaderHeight={44}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize } } }}
          slots={{
            noRowsOverlay: () => (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <Typography color="text.secondary">{emptyMessage}</Typography>
              </Box>
            ),
          }}
          sx={defaultSx}
        />
      </Box>
    </Card>
  );
}
