import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const buildTableBody = (sessions = []) =>
  sessions.map((session) => [
    session.day,
    session.time,
    session.courseName,
    session.facultyName,
    session.roomId,
  ]);

export const exportTimetableToPDF = ({ timetable, filename = 'timetable.pdf' }) => {
  if (!timetable) return;

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('SmartSlot Timetable', 14, 20);

  autoTable(doc, {
    head: [['Day', 'Time', 'Course', 'Faculty', 'Room']],
    body: buildTableBody(timetable.sessions),
    startY: 30,
  });

  doc.save(filename);
};

export const exportTimetableToCSV = ({ timetable, filename = 'timetable.csv' }) => {
  if (!timetable) return;

  const header = ['Day', 'Time', 'Course', 'Faculty', 'Room'];
  const rows = timetable.sessions.map((session) => [
    session.day,
    session.time,
    session.courseName,
    session.facultyName,
    session.roomId,
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default {
  exportTimetableToPDF,
  exportTimetableToCSV,
};
