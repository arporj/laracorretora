"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { createClient } from "@/lib/supabase/server";
import type { StatusLead } from "@/lib/domain/types";

export async function updateLeadStatus(leadId: string, status: StatusLead) {
  await requireAuth();
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);
  if (error) throw error;

  revalidatePath("/admin/leads");
}
