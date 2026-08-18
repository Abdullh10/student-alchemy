import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const goTo = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex items-center gap-2 text-muted-foreground w-48 justify-start"
        onClick={() => setOpen(true)}
      >
        <Search className="w-4 h-4" />
        <span className="text-xs">بحث عن طالب أو شعبة...</span>
      </Button>
      <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setOpen(true)}>
        <Search className="w-5 h-5" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="ابحث عن اسم طالب أو شعبة..." />
        <CommandList>
          <CommandEmpty>لا توجد نتائج</CommandEmpty>
          <CommandGroup heading="الطلاب">
            {students.slice(0, 50).map((s) => (
              <CommandItem key={s.id} value={s.name} onSelect={() => goTo(`/students/${s.id}`)}>
                <User className="ml-2 w-4 h-4" />
                {s.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="الشعب">
            {classes.map((c) => (
              <CommandItem key={c.id} value={c.name} onSelect={() => goTo(`/classes/${c.id}`)}>
                <BookOpen className="ml-2 w-4 h-4" />
                {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
