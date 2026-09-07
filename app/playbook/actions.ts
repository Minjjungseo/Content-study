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

function buildPlaybookData(formData: FormData) {
  const accounts = formData.getAll("appliedAccounts") as string[];
  return {
    title: str(formData, "title") ?? "제목 없음",
    category: str(formData, "category") ?? "OTHER",
    description: str(formData, "description"),
    appliedAccounts: accounts.length ? accounts.join(",") : null,
    appliedContentIP: str(formData, "appliedContentIP"),
    memo: str(formData, "memo"),
    status: str(formData, "status") ?? "CANDIDATE",
  };
}

export async function createPlaybookRule(formData: FormData) {
  const rule = await prisma.playbookRule.create({ data: buildPlaybookData(formData) });
  revalidatePath("/playbook");
  redirect(`/playbook/${rule.id}`);
}

export async function updatePlaybookRule(id: string, formData: FormData) {
  await prisma.playbookRule.update({ where: { id }, data: buildPlaybookData(formData) });
  revalidatePath("/playbook");
  revalidatePath(`/playbook/${id}`);
  redirect(`/playbook/${id}`);
}

export async function deletePlaybookRule(id: string) {
  await prisma.playbookRule.delete({ where: { id } });
  revalidatePath("/playbook");
  redirect("/playbook");
}

export async function setPlaybookStatus(id: string, formData: FormData) {
  const status = str(formData, "status") ?? "CANDIDATE";
  await prisma.playbookRule.update({ where: { id }, data: { status } });
  revalidatePath("/playbook");
  revalidatePath(`/playbook/${id}`);
}

export async function addEvidence(playbookRuleId: string, formData: FormData) {
  const experimentId = str(formData, "experimentId");
  if (!experimentId) return;

  const review = await prisma.review.findUnique({ where: { experimentId } });

  await prisma.playbookEvidence.upsert({
    where: { playbookRuleId_experimentId: { playbookRuleId, experimentId } },
    create: { playbookRuleId, experimentId, reviewId: review?.id },
    update: {},
  });

  revalidatePath(`/playbook/${playbookRuleId}`);
}

export async function removeEvidence(evidenceId: string, playbookRuleId: string) {
  await prisma.playbookEvidence.delete({ where: { id: evidenceId } });
  revalidatePath(`/playbook/${playbookRuleId}`);
}
