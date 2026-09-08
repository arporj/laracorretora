"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { updateLeadStatus as updateLeadStatusRepo } from "@/lib/leads";
import type { StatusLead } from "@/lib/domain/types";

export async function updateLeadStatus(leadId: string, status: StatusLead) {
  await requireAuth();
  await updateLeadStatusRepo(leadId, status);
  revalidatePath("/admin/leads");
}
