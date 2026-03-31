import * as reportRepo from "../../repositories/report.repository.js";
import { NotFoundError, ValidationError, ConflictError } from "../../utils/errors.js";

async function createReport(reportData) {
  const { contentId, userId } = reportData;

  const existingReport = await reportRepo.findFirst({
    userId,
    contentId,
  });

  if (existingReport) {
    throw new ConflictError("Ya has reportado este contenido anteriormente.");
  }

  const newReport = await reportRepo.create(reportData);
  return { report: newReport };
}

async function getAllReports(filters = {}) {
  const reports = await reportRepo.findMany(filters);
  return { reports };
}

async function updateReportStatus(reportId, status) {
  const allowedStatus = ["PENDING", "REVIEWED", "REJECTED", "RESOLVED"];
  if (!allowedStatus.includes(status)) {
    throw new ValidationError("Estado de reporte no válido.");
  }

  const updatedReport = await reportRepo.update(reportId, { status });

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
