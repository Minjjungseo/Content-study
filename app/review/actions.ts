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

export async function upsertReview(experimentId: string, formData: FormData) {
  const data = {
    whatWentWell: str(formData, "whatWentWell"),
    whatWasLacking: str(formData, "whatWasLacking"),
    unexpected: str(formData, "unexpected"),
    feelings: str(formData, "feelings"),
    whatToChange: str(formData, "whatToChange"),
    oneLearning: str(formData, "oneLearning"),
    result: str(formData, "result"),
    whatWeLearned: str(formData, "whatWeLearned"),
    nextOneThing: str(formData, "nextOneThing"),
    nextExperimentNote: str(formData, "nextExperimentNote"),
  };

  await prisma.review.upsert({
    where: { experimentId },
    create: { experimentId, ...data },
    update: data,
  });

  await prisma.experiment.update({
    where: { id: experimentId },
    data: { status: "REVIEWED" },
  });
  const experiment = await prisma.experiment.findUnique({ where: { id: experimentId } });
  if (experiment) {
    await prisma.idea.update({ where: { id: experiment.ideaId }, data: { status: "REVIEWED" } });
  }

  revalidatePath(`/review/${experimentId}`);
  revalidatePath("/review");
  revalidatePath("/lab");
  revalidatePath("/");
  redirect(`/review/${experimentId}`);
}

export async function upsertPerformance(
  publishedContentId: string,
  experimentId: string,
  formData: FormData
) {
  const data = {
    views: num(formData, "views"),
    reach: num(formData, "reach"),
    avgWatchTime: num(formData, "avgWatchTime"),
    retention3s: num(formData, "retention3s"),
    completionRate: num(formData, "completionRate"),
    likes: num(formData, "likes"),
    comments: num(formData, "comments"),
    saves: num(formData, "saves"),
    shares: num(formData, "shares"),
    profileVisits: num(formData, "profileVisits"),
    followsGained: num(formData, "followsGained"),
  };

  await prisma.performance.upsert({
    where: { publishedContentId },
    create: { publishedContentId, ...data },
    update: data,
  });

  revalidatePath(`/review/${experimentId}`);
}

export async function createPlaybookCandidateFromReview(
  experimentId: string,
  formData: FormData
) {
  const title = str(formData, "title") ?? "새 Playbook 후보";
  const category = str(formData, "category") ?? "OTHER";
  const description = str(formData, "description");

  const review = await prisma.review.findUnique({ where: { experimentId } });

  const rule = await prisma.playbookRule.create({
    data: {
      title,
      category,
      description,
      status: "CANDIDATE",
      evidence: {
        create: { experimentId, reviewId: review?.id },
      },
    },
  });

  revalidatePath("/playbook");
  revalidatePath(`/review/${experimentId}`);
  redirect(`/playbook/${rule.id}`);
}
