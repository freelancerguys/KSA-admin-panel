export async function downloadIdCard(api, { studentId, fallbackName = 'KSA-ID-Card' } = {}) {
  const url = studentId ? `/students/${studentId}/id-card` : '/students/id-card';
  const res = await api.get(url, { responseType: 'blob' });

  const disposition = res.headers['content-disposition'] || '';
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const filename = match?.[1] || `${fallbackName}.pdf`;

  const blob = new Blob([res.data], { type: 'application/pdf' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
