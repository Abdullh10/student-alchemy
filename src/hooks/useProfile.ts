import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { Profile } from "@/types/domain";
import { toast } from "sonner";

export function useUpdateProfile() {
  const { user, refreshProfile } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error("غير مصرح");
      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refreshProfile();
      qc.invalidateQueries();
      toast.success("تم حفظ التعديلات");
    },
    onError: (e: Error) => toast.error(e.message || "فشل الحفظ"),
  });
}
