import * as reportController from "./report.controller.js";
import isAdmin from "../../middlewares/isAdmin.js";
import {
  createReportSchema,
  getAllReportsSchema,
  updateReportStatusSchema,
} from "./report.schema.js";

async function reportRoutes(fastify) {
  fastify.register(async function (userRoutes) {
    userRoutes.addHook("onRequest", fastify.authenticate);

    userRoutes.post(
      "/reports",
      { schema: createReportSchema },
      reportController.createReport,
    );
  });

  fastify.register(async function (adminRoutes) {
    adminRoutes.addHook("onRequest", isAdmin);

    adminRoutes.get(
      "/admin/reports",
      { schema: getAllReportsSchema },
      reportController.getAllReports,
    );

    adminRoutes.patch(
      "/admin/reports/:reportId",
      { schema: updateReportStatusSchema },
      reportController.updateReportStatus,
    );
  });
}

export default reportRoutes;
