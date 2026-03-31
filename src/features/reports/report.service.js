import prisma from "../../config/prisma.js";
import { NotFoundError, ValidationError, ConflictError } from "../../utils/errors.js";

async function createReport(reportData) {
  const { contentId, userId, target, reason, details } = reportData;

  const existingReport = await prisma.report.findFirst({
    where: {
      userId,
      contentId,
    },
  });

  if (existingReport) {
    throw new ConflictError("Ya has reportado este contenido anteriormente.");
  }

  const newReport = await prisma.report.create({
    data: {
      userId,
      contentId,
      target,
      reason,
      details,
    },
  });

  return { report: newReport };
}

async function getAllReports(filters = {}) {
  const reports = await prisma.report.findMany({
    where: filters,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { username: true, email: true },
      },
    },
  });

  return { reports };
}

async function updateReportStatus(reportId, status) {
  const allowedStatus = ["PENDING", "REVIEWED", "REJECTED", "RESOLVED"];
  if (!allowedStatus.includes(status)) {
    throw new ValidationError("Estado de reporte no válido.");
  }

  const updatedReport = await prisma.report.update({
    where: { id: reportId },
    data: { status },
  });

  if (!updatedReport) {
    throw new NotFoundError("Reporte no encontrado.");
  }

  return { report: updatedReport };
}

export {
  createReport,
  getAllReports,
  updateReportStatus,
};
