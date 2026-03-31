import * as reportService from "./report.service.js";

// Crear un reporte
async function createReport(request, reply) {
  const { userId } = request.user;
  const result = await reportService.createReport({ ...request.body, userId });
  reply.code(201).send(result);
}

// Controlador para que un administrador obtenga todos los reportes
async function getAllReports(request, reply) {
  const filters = request.query;
  const result = await reportService.getAllReports(filters);
  reply.send(result);
}

// Controlador para que un administrador actualice el estado de un reporte
async function updateReportStatus(request, reply) {
  const { reportId } = request.params;
  const { status } = request.body;

  const result = await reportService.updateReportStatus(reportId, status);
  reply.send(result);
}

export {
  createReport,
  getAllReports,
  updateReportStatus,
};
