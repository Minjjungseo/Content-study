"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type IdeaFormState = { error?: string };

const SAVE_ERROR: IdeaFormState = {
  error: "아이디어를 저장하지 못했습니다. 다시 시도해주세요.",
};
const DELETE_ERROR = "아이디어를 삭제하지 못했습니다. 다시 시도해주세요.";

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
    myPriority: str(formData, "myPriority") ?? "P2",
    status: str(formData, "status") ?? "IDEA",
    shootDifficulty: str(formData, "shootDifficulty") ?? "MEDIUM",
    needsShoot: formData.get("needsShoot") === "on",
    hasExistingFootage: formData.get("hasExistingFootage") === "on",
    brandValue: str(formData, "brandValue") ?? "MEDIUM",
    oneThing: str(formData, "oneThing"),
  };
}

export async function createIdea(
  _prevState: IdeaFormState,
  formData: FormData
): Promise<IdeaFormState> {
  let ideaId: string;
  try {
    const idea = await prisma.idea.create({ data: buildIdeaData(formData) });
    ideaId = idea.id;
  } catch (err) {
    console.error("createIdea failed:", err);
    return SAVE_ERROR;
  }
  revalidatePath("/ideas");
  revalidatePath("/");
  redirect(`/ideas/${ideaId}`);
}

export async function updateIdea(
  id: string,
  _prevState: IdeaFormState,
  formData: FormData
): Promise<IdeaFormState> {
  try {
    await prisma.idea.update({ where: { id }, data: buildIdeaData(formData) });
  } catch (err) {
    console.error("updateIdea failed:", err);
    return SAVE_ERROR;
  }
  revalidatePath("/ideas");
  revalidatePath(`/ideas/${id}`);
  revalidatePath("/");
  redirect(`/ideas/${id}`);
}

export async function deleteIdea(id: string) {
  try {
    await prisma.idea.delete({ where: { id } });
  } catch (err) {
    console.error("deleteIdea failed:", err);
    throw new Error(DELETE_ERROR);
  }
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
