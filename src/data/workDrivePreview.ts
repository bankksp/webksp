import { AnnualWorkDrive } from '../types';

/** ตัวอย่างคลังงานรายปี — ดูก่อนอัปโหลดจริง */
export const SAMPLE_WORK_DRIVE: AnnualWorkDrive = {
  version: 1,
  years: [
    {
      year: '2569',
      folders: [
        {
          id: 'folder-sample-1',
          name: 'โครงการ / งานประจำปี',
          createdAt: '2026-01-10T00:00:00.000Z',
          files: [
            {
              id: 'file-1',
              name: 'เกียรติบัตรผลงานดีเด่น.pdf',
              url: '/preview-cert-sample.png',
              mimeType: 'image/png',
              size: 245000,
              uploadedAt: '2026-01-16T00:00:00.000Z',
            },
            {
              id: 'file-2',
              name: 'รายงานผลการดำเนินงาน.docx',
              url: '',
              mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              size: 512000,
              uploadedAt: '2026-02-01T00:00:00.000Z',
            },
          ],
        },
        {
          id: 'folder-sample-2',
          name: 'เลื่อนเงินเดือน',
          createdAt: '2026-03-01T00:00:00.000Z',
          files: [
            {
              id: 'file-3',
              name: 'แบบฟอร์ม ค.ศ.๙.pdf',
              url: '',
              mimeType: 'application/pdf',
              size: 890000,
              uploadedAt: '2026-03-05T00:00:00.000Z',
            },
          ],
        },
      ],
    },
    {
      year: '2568',
      folders: [
        {
          id: 'folder-sample-3',
          name: 'อบรม / สัมมนา',
          createdAt: '2025-06-01T00:00:00.000Z',
          files: [
            {
              id: 'file-4',
              name: 'ภาพกิจกรรมอบรม.jpg',
              url: '/preview-cert-sample.png',
              mimeType: 'image/jpeg',
              size: 1200000,
              uploadedAt: '2025-11-20T00:00:00.000Z',
            },
          ],
        },
      ],
    },
  ],
};
