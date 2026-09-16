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
