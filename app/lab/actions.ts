"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}

function num(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function updateExperiment(id: string, formData: FormData) {
  await prisma.experiment.update({
    where: { id },
    data: {
      oneThingToTest: str(formData, "oneThingToTest"),
      hook: str(formData, "hook"),
      coreMessage: str(formData, "coreMessage"),
      structureSteps: str(formData, "structureSteps"),
      neededShooting: str(formData, "neededShooting"),
      existingFootage: str(formData, "existingFootage"),
      cta: str(formData, "cta"),
      thumbnailNote: str(formData, "thumbnailNote"),
      captionMemo: str(formData, "captionMemo"),
      hypothesis: str(formData, "hypothesis"),
    },
  });
  revalidatePath(`/lab/${id}`);
  revalidatePath("/lab");
  revalidatePath("/");
  redirect(`/lab/${id}`);
}

export async function setExperimentStatus(id: string, formData: FormData) {
  const status = str(formData, "status");
  if (!status) return;
  await prisma.experiment.update({ where: { id }, data: { status } });

  const experiment = await prisma.experiment.findUnique({ where: { id } });
  if (experiment) {
    await prisma.idea.update({ where: { id: experiment.ideaId }, data: { status } });
  }

  revalidatePath(`/lab/${id}`);
  revalidatePath("/lab");
  revalidatePath("/");
  if (experiment) revalidatePath(`/ideas/${experiment.ideaId}`);
}

export async function deleteExperiment(id: string) {
  const experiment = await prisma.experiment.findUnique({ where: { id } });
  await prisma.experiment.delete({ where: { id } });
  revalidatePath("/lab");
  revalidatePath("/");
  if (experiment) revalidatePath(`/ideas/${experiment.ideaId}`);
  redirect("/lab");
}

export async function addPublishedContent(experimentId: string, formData: FormData) {
  const platform = str(formData, "platform") ?? "INSTAGRAM";
  const publishedAtRaw = str(formData, "publishedAt");

  await prisma.publishedContent.create({
    data: {
      experimentId,
      platform,
      publishedAt: publishedAtRaw ? new Date(publishedAtRaw) : new Date(),
      actualHook: str(formData, "actualHook"),
      actualThumbnailUrl: str(formData, "actualThumbnailUrl"),
      videoLength: num(formData, "videoLength"),
      url: str(formData, "url"),
    },
  });

  await prisma.experiment.update({
    where: { id: experimentId },
    data: { status: "PUBLISHED" },
  });
  const experiment = await prisma.experiment.findUnique({ where: { id: experimentId } });
  if (experiment) {
    await prisma.idea.update({ where: { id: experiment.ideaId }, data: { status: "PUBLISHED" } });
  }

  revalidatePath(`/lab/${experimentId}`);
  revalidatePath("/lab");
  revalidatePath("/");
}

export async function deletePublishedContent(publishedContentId: string, experimentId: string) {
  await prisma.publishedContent.delete({ where: { id: publishedContentId } });
  revalidatePath(`/lab/${experimentId}`);
  revalidatePath("/lab");
}
