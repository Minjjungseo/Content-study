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

function buildIdeaData(formData: FormData) {
  return {
    title: str(formData, "title") ?? "제목 없음",
    account: str(formData, "account") ?? "HEYELIA",
    contentIP: str(formData, "contentIP"),
    coreMessage: str(formData, "coreMessage"),
    memo: str(formData, "memo"),
    myPriority: str(formData, "myPriority") ?? "P3",
    status: str(formData, "status") ?? "IDEA",
    shootDifficulty: str(formData, "shootDifficulty") ?? "MEDIUM",
    needsShoot: formData.get("needsShoot") === "on",
    hasExistingFootage: formData.get("hasExistingFootage") === "on",
    brandValue: str(formData, "brandValue") ?? "MEDIUM",
    oneThing: str(formData, "oneThing"),
  };
}

export async function createIdea(formData: FormData) {
  const idea = await prisma.idea.create({ data: buildIdeaData(formData) });
  revalidatePath("/ideas");
  revalidatePath("/");
  redirect(`/ideas/${idea.id}`);
}

export async function updateIdea(id: string, formData: FormData) {
  await prisma.idea.update({ where: { id }, data: buildIdeaData(formData) });
  revalidatePath("/ideas");
  revalidatePath(`/ideas/${id}`);
  revalidatePath("/");
  redirect(`/ideas/${id}`);
}

export async function deleteIdea(id: string) {
  await prisma.idea.delete({ where: { id } });
  revalidatePath("/ideas");
  revalidatePath("/");
  redirect("/ideas");
}

export async function linkExistingStudy(ideaId: string, formData: FormData) {
  const studyId = str(formData, "studyId");
  if (!studyId) return;

  await prisma.studyIdeaLink.upsert({
    where: { studyId_ideaId: { studyId, ideaId } },
    create: { studyId, ideaId },
    update: {},
  });

  revalidatePath(`/ideas/${ideaId}`);
  revalidatePath(`/study/${studyId}`);
}

export async function setSourceStudy(ideaId: string, formData: FormData) {
  const studyId = str(formData, "sourceStudyId");
  const oneThing = str(formData, "oneThing");

  await prisma.idea.update({
    where: { id: ideaId },
    data: {
      sourceStudyId: studyId ?? null,
      oneThing: oneThing ?? undefined,
    },
  });

  revalidatePath(`/ideas/${ideaId}`);
  revalidatePath("/");
}

export async function createExperimentFromIdea(ideaId: string) {
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) return;

  const experiment = await prisma.experiment.create({
    data: {
      ideaId,
      oneThingToTest: idea.oneThing,
      coreMessage: idea.coreMessage,
      status: "PLANNED",
    },
  });

  if (idea.status === "IDEA") {
    await prisma.idea.update({ where: { id: ideaId }, data: { status: "PLANNED" } });
  }

  revalidatePath(`/ideas/${ideaId}`);
  revalidatePath("/lab");
  revalidatePath("/");
  redirect(`/lab/${experiment.id}`);
}
