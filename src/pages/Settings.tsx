import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileEditor } from "@/components/settings/ProfileEditor";
import { GradeCriteriaEditor } from "@/components/settings/GradeCriteriaEditor";
import { NoteTypesEditor } from "@/components/settings/NoteTypesEditor";
import { useNoteTypes } from "@/hooks/useGradeSettings";

export default function Settings() {
  const location = useLocation();
  const { data: noteTypes = [] } = useNoteTypes();
  const defaultTab = location.pathname === "/profile" ? "profile" : "grading";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">الإعدادات</h1>
        <p className="text-sm text-muted-foreground mt-1">تحكّم في ملفك الشخصي ونظام التقييم الخاص بك</p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="grading">نظام التقييم والموازنة</TabsTrigger>
          <TabsTrigger value="noteTypes">أنواع الملاحظات</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-5">
          <ProfileEditor />
        </TabsContent>
        <TabsContent value="grading" className="mt-5">
          <GradeCriteriaEditor />
        </TabsContent>
        <TabsContent value="noteTypes" className="mt-5">
          <NoteTypesEditor noteTypes={noteTypes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
