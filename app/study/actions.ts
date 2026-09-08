"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}

async function saveFileToUploads(file: File): Promise<string | null> {
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), bytes);
    return `/uploads/${fileName}`;
  } catch {
    // Serverless deployments (e.g. Vercel) have a read-only filesystem outside
    // /tmp, so local file uploads can't persist there. Skip the file rather
    // than failing the whole Study save — every other field still saves.
    return null;
  }
}

async function saveImageIfPresent(formData: FormData): Promise<string | null> {
  const file = formData.get("imageFile");
  if (!(file instanceof File) || file.size === 0) return null;
  return saveFileToUploads(file);
}

type NewAttachment = { fileName: string; fileUrl: string; fileType: string | null; fileSize: number };

async function saveAttachmentsIfPresent(formData: FormData): Promise<NewAttachment[]> {
  const files = formData.getAll("attachmentFiles");
  const results: NewAttachment[] = [];
  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    const fileUrl = await saveFileToUploads(file);
    if (!fileUrl) continue;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? null;
    results.push({ fileName: file.name, fileUrl, fileType: ext, fileSize: file.size });
  }
  return results;
}

function buildStudyData(formData: FormData) {
  const applicableElements = formData.getAll("applicableElements") as string[];
  return {
    title: str(formData, "title") ?? "제목 없음",
    studyType: str(formData, "studyType") ?? "INSIGHT",
    sourceName: str(formData, "sourceName"),
    url: str(formData, "url"),
    memo: str(formData, "memo"),
    account: str(formData, "account") ?? "COMMON",
    category: str(formData, "category"),
    importance: str(formData, "importance") ?? "MEDIUM",
    tags: str(formData, "tags"),
    keyContent: str(formData, "keyContent"),
    applicableElements: applicableElements.length
      ? applicableElements.join(",")
      : null,
    oneThing: str(formData, "oneThing"),
    refHook: str(formData, "refHook"),
    refPromise: str(formData, "refPromise"),
    refStructure: str(formData, "refStructure"),
    refEmotion: str(formData, "refEmotion"),
    refVisual: str(formData, "refVisual"),
    refPayoff: str(formData, "refPayoff"),
    refWhyItWorks: str(formData, "refWhyItWorks"),
    learnedWhat: str(formData, "learnedWhat"),
    learnedWhy: str(formData, "learnedWhy"),
    learnedWhere: str(formData, "learnedWhere"),
  };
}

export async function createStudy(formData: FormData) {
  const data = buildStudyData(formData);
  const imageUrl = await saveImageIfPresent(formData);
  const newAttachments = await saveAttachmentsIfPresent(formData);
  const study = await prisma.study.create({
    data: {
      ...data,
      ...(imageUrl ? { imageUrl } : {}),
      ...(newAttachments.length ? { attachments: { create: newAttachments } } : {}),
    },
  });
  revalidatePath("/study");
  revalidatePath("/");
  redirect(`/study/${study.id}`);
}

export async function updateStudy(id: string, formData: FormData) {
  const data = buildStudyData(formData);
  const imageUrl = await saveImageIfPresent(formData);
  const newAttachments = await saveAttachmentsIfPresent(formData);
  await prisma.study.update({
    where: { id },
    data: {
      ...data,
      ...(imageUrl ? { imageUrl } : {}),
      ...(newAttachments.length ? { attachments: { create: newAttachments } } : {}),
    },
  });
  revalidatePath("/study");
  revalidatePath(`/study/${id}`);
  revalidatePath("/");
  redirect(`/study/${id}`);
}

export async function deleteStudy(id: string) {
  await prisma.study.delete({ where: { id } });
  revalidatePath("/study");
  revalidatePath("/");
  redirect("/study");
}

export async function deleteStudyAttachment(
  studyId: string,
  attachmentId: string
) {
  await prisma.studyAttachment.delete({ where: { id: attachmentId } });
  revalidatePath(`/study/${studyId}`);
  revalidatePath(`/study/${studyId}/edit`);
}

export async function linkStudyToExistingIdea(
  studyId: string,
  formData: FormData
) {
  const ideaId = str(formData, "ideaId");
  if (!ideaId) return;
  const oneThing = str(formData, "oneThing");
  const setAsSource = formData.get("setAsSource") === "on";

  await prisma.studyIdeaLink.upsert({
    where: { studyId_ideaId: { studyId, ideaId } },
    create: { studyId, ideaId },
    update: {},
  });

  if (setAsSource) {
    await prisma.idea.update({
      where: { id: ideaId },
      data: {
        sourceStudyId: studyId,
        oneThing: oneThing ?? undefined,
      },
    });
  }

  revalidatePath(`/study/${studyId}`);
  revalidatePath(`/ideas/${ideaId}`);
  revalidatePath("/ideas");
  revalidatePath("/");
  redirect(`/ideas/${ideaId}`);
}

export async function createIdeaFromStudy(studyId: string, formData: FormData) {
  const title = str(formData, "title") ?? "새 아이디어";
  const account = str(formData, "account") ?? "HEYELIA";
  const oneThing = str(formData, "oneThing");

  const idea = await prisma.idea.create({
    data: {
      title,
      account,
      sourceStudyId: studyId,
      oneThing: oneThing ?? undefined,
    },
  });

  await prisma.studyIdeaLink.create({
    data: { studyId, ideaId: idea.id },
  });

  revalidatePath(`/study/${studyId}`);
  revalidatePath("/ideas");
  revalidatePath("/");
  redirect(`/ideas/${idea.id}`);
}

export async function unlinkStudyFromIdea(
  studyId: string,
  ideaId: string
) {
  await prisma.studyIdeaLink.delete({
    where: { studyId_ideaId: { studyId, ideaId } },
  });
  revalidatePath(`/study/${studyId}`);
  revalidatePath(`/ideas/${ideaId}`);
}
