"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export type RecordFormState = { error?: string };

const SAVE_ERROR: RecordFormState = {
  error: "저장하지 못했습니다. 다시 시도해주세요.",
};

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}

function num(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function dateVal(formData: FormData, key: string): Date | null {
  const v = str(formData, key);
  if (v == null) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
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
    // than failing the whole save — every other field still saves.
    return null;
  }
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

export async function createRecord(
  _prevState: RecordFormState,
  formData: FormData
): Promise<RecordFormState> {
  const title = str(formData, "title");
  if (!title) return { error: "제목을 입력해주세요." };

  let recordId: string;
  try {
    const newAttachments = await saveAttachmentsIfPresent(formData);
    const record = await prisma.learningRecord.create({
      data: {
        type: str(formData, "type") ?? "LECTURE",
        account: str(formData, "account") ?? "COMMON",
        title,
        sourceUrl: str(formData, "sourceUrl"),
        sourceMemo: str(formData, "sourceMemo"),
        takeaway: str(formData, "takeaway"),
        priority: str(formData, "priority") ?? "P2",
        ...(newAttachments.length ? { attachments: { create: newAttachments } } : {}),
      },
    });
    recordId = record.id;
  } catch (err) {
    console.error("createRecord failed:", err);
    return SAVE_ERROR;
  }
  revalidatePath("/records");
  revalidatePath("/");
  redirect(`/records/${recordId}`);
}

export async function updateSource(
  id: string,
  _prevState: RecordFormState,
  formData: FormData
): Promise<RecordFormState> {
  const title = str(formData, "title");
  if (!title) return { error: "제목을 입력해주세요." };

  try {
    const newAttachments = await saveAttachmentsIfPresent(formData);
    await prisma.learningRecord.update({
      where: { id },
      data: {
        type: str(formData, "type") ?? "LECTURE",
        account: str(formData, "account") ?? "COMMON",
        title,
        sourceUrl: str(formData, "sourceUrl"),
        sourceMemo: str(formData, "sourceMemo"),
        takeaway: str(formData, "takeaway"),
        priority: str(formData, "priority") ?? "P2",
        tags: str(formData, "tags"),
        ...(newAttachments.length ? { attachments: { create: newAttachments } } : {}),
      },
    });
  } catch (err) {
    console.error("updateSource failed:", err);
    return SAVE_ERROR;
  }
  revalidatePath("/records");
  revalidatePath(`/records/${id}`);
  revalidatePath("/");
  redirect(`/records/${id}`);
}

export async function updateApply(
  id: string,
  _prevState: RecordFormState,
  formData: FormData
): Promise<RecordFormState> {
  try {
    await prisma.learningRecord.update({
      where: { id },
      data: {
        applyTitle: str(formData, "applyTitle"),
        contentSeries: str(formData, "contentSeries"),
        applyPoint: str(formData, "applyPoint"),
        hook: str(formData, "hook"),
        plan: str(formData, "plan"),
        shootingMemo: str(formData, "shootingMemo"),
      },
    });
  } catch (err) {
    console.error("updateApply failed:", err);
    return SAVE_ERROR;
  }
  revalidatePath(`/records/${id}`);
  revalidatePath("/");
  redirect(`/records/${id}`);
}

export async function updateReview(
  id: string,
  _prevState: RecordFormState,
  formData: FormData
): Promise<RecordFormState> {
  try {
    await prisma.learningRecord.update({
      where: { id },
      data: {
        publishedUrl: str(formData, "publishedUrl"),
        publishedAt: dateVal(formData, "publishedAt"),
        views: num(formData, "views"),
        reach: num(formData, "reach"),
        avgWatchTime: num(formData, "avgWatchTime"),
        retentionRate: num(formData, "retentionRate"),
        saves: num(formData, "saves"),
        shares: num(formData, "shares"),
        comments: num(formData, "comments"),
        follows: num(formData, "follows"),
        good: str(formData, "good"),
        problem: str(formData, "problem"),
        learning: str(formData, "learning"),
      },
    });
  } catch (err) {
    console.error("updateReview failed:", err);
    return SAVE_ERROR;
  }
  revalidatePath(`/records/${id}`);
  revalidatePath("/records");
  revalidatePath("/");
  redirect(`/records/${id}`);
}

export async function updateNext(
  id: string,
  _prevState: RecordFormState,
  formData: FormData
): Promise<RecordFormState> {
  try {
    await prisma.learningRecord.update({
      where: { id },
      data: {
        nextThing: str(formData, "nextThing"),
        decision: str(formData, "decision"),
      },
    });
  } catch (err) {
    console.error("updateNext failed:", err);
    return SAVE_ERROR;
  }
  revalidatePath(`/records/${id}`);
  revalidatePath("/");
  redirect(`/records/${id}`);
}

export async function deleteRecord(id: string) {
  await prisma.learningRecord.delete({ where: { id } });
  revalidatePath("/records");
  revalidatePath("/");
  redirect("/records");
}

export async function deleteAttachment(recordId: string, attachmentId: string) {
  await prisma.recordAttachment.delete({ where: { id: attachmentId } });
  revalidatePath(`/records/${recordId}`);
  revalidatePath(`/records/${recordId}/edit`);
}

export async function saveAsPlaybook(recordId: string, formData: FormData) {
  const title = str(formData, "title");
  if (!title) return;
  const category = str(formData, "category") ?? "OTHER";

  const rule = await prisma.playbookRule.create({
    data: {
      title,
      category,
      appliedAccounts: str(formData, "appliedAccounts"),
      appliedContentIP: str(formData, "appliedContentIP"),
    },
  });

  await prisma.recordPlaybookLink.upsert({
    where: { recordId_playbookRuleId: { recordId, playbookRuleId: rule.id } },
    create: { recordId, playbookRuleId: rule.id },
    update: {},
  });

  await prisma.learningRecord.update({
    where: { id: recordId },
    data: { playbookSaved: true },
  });

  revalidatePath(`/records/${recordId}`);
  revalidatePath("/playbook");
  redirect(`/playbook/${rule.id}`);
}
