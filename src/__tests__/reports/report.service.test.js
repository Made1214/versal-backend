import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockReport = {
  id: 'report-123',
  userId: 'user-123',
  contentId: 'content-123',
  target: 'STORY',
  reason: 'SPAM',
  details: 'This is spam content',
  status: 'PENDING',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  user: { username: 'reporter', email: 'reporter@example.com' },
};

// Mock dependencies
vi.mock('../../config/prisma.js', () => ({
  default: {
    report: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import * as reportService from '../../features/reports/report.service.js';
import prisma from '../../config/prisma.js';

describe('Report Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createReport', () => {
    it('should create report successfully', async () => {
      const newReport = {
        userId: 'user-123',
        contentId: 'content-123',
        target: 'STORY',
        reason: 'SPAM',
        details: 'This is spam',
      };
      prisma.report.findFirst.mockResolvedValue(null);
      prisma.report.create.mockResolvedValue(mockReport);

      const result = await reportService.createReport(newReport);

      expect(result.report).toBeDefined();
      expect(result.report.reason).toBe('SPAM');
      expect(prisma.report.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          contentId: 'content-123',
          target: 'STORY',
          reason: 'SPAM',
          details: 'This is spam',
        },
      });
    });

    it('should throw error when report already exists', async () => {
      const newReport = {
        userId: 'user-123',
        contentId: 'content-123',
        target: 'STORY',
        reason: 'SPAM',
      };
      prisma.report.findFirst.mockResolvedValue(mockReport);

      await expect(
        reportService.createReport(newReport)
      ).rejects.toThrow('Ya has reportado este contenido anteriormente');
    });
  });

  describe('getAllReports', () => {
    it('should return all reports', async () => {
      prisma.report.findMany.mockResolvedValue([mockReport]);

      const result = await reportService.getAllReports();

      expect(result.reports).toHaveLength(1);
      expect(prisma.report.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { username: true, email: true },
          },
        },
      });
    });

    it('should filter reports by status', async () => {
      prisma.report.findMany.mockResolvedValue([mockReport]);

      const result = await reportService.getAllReports({ status: 'PENDING' });

      expect(result.reports).toHaveLength(1);
      expect(prisma.report.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { username: true, email: true },
          },
        },
      });
    });

    it('should filter reports by target', async () => {
      prisma.report.findMany.mockResolvedValue([mockReport]);

      const result = await reportService.getAllReports({ target: 'STORY' });

      expect(result.reports).toHaveLength(1);
      expect(prisma.report.findMany).toHaveBeenCalledWith({
        where: { target: 'STORY' },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { username: true, email: true },
          },
        },
      });
    });
  });

  describe('updateReportStatus', () => {
    it('should update report status to REVIEWED', async () => {
      prisma.report.update.mockResolvedValue({ ...mockReport, status: 'REVIEWED' });

      const result = await reportService.updateReportStatus('report-123', 'REVIEWED');

      expect(result.report.status).toBe('REVIEWED');
      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 'report-123' },
        data: { status: 'REVIEWED' },
      });
    });

    it('should update report status to RESOLVED', async () => {
      prisma.report.update.mockResolvedValue({ ...mockReport, status: 'RESOLVED' });

      const result = await reportService.updateReportStatus('report-123', 'RESOLVED');

      expect(result.report.status).toBe('RESOLVED');
    });

    it('should update report status to REJECTED', async () => {
      prisma.report.update.mockResolvedValue({ ...mockReport, status: 'REJECTED' });

      const result = await reportService.updateReportStatus('report-123', 'REJECTED');

      expect(result.report.status).toBe('REJECTED');
    });

    it('should throw error for invalid status', async () => {
      await expect(
        reportService.updateReportStatus('report-123', 'INVALID_STATUS')
      ).rejects.toThrow('Estado de reporte no válido');
    });

    it('should throw error when report not found', async () => {
      prisma.report.update.mockResolvedValue(null);

      await expect(
        reportService.updateReportStatus('nonexistent', 'REVIEWED')
      ).rejects.toThrow('Reporte no encontrado');
    });
  });

  describe('getAllReports - multiple filters', () => {
    it('should filter by multiple criteria', async () => {
      prisma.report.findMany.mockResolvedValue([mockReport]);

      const result = await reportService.getAllReports({
        status: 'PENDING',
        target: 'STORY',
      });

      expect(result.reports).toHaveLength(1);
      expect(prisma.report.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING', target: 'STORY' },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { username: true, email: true },
          },
        },
      });
    });
  });
});
