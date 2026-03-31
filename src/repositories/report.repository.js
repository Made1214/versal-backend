/**
 * Report Repository - Acceso a datos para Report
 */

import prisma from "../config/prisma.js";

const reportInclude = {
  user: {
    select: { username: true, email: true },
  },
};

export async function findFirst(where) {
  return await prisma.report.findFirst({ where });
}

export async function create(data) {
  return await prisma.report.create({ data });
}

export async function findMany(where = {}) {
  return await prisma.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: reportInclude,
  });
}

export async function findById(id) {
  return await prisma.report.findUnique({
    where: { id },
    include: reportInclude,
  });
}

export async function update(id, data) {
  return await prisma.report.update({
    where: { id },
    data,
    include: reportInclude,
  });
}
