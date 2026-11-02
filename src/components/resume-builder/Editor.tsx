"use client";

import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import SortableSection from "./SortableSection";
import { Plus } from "lucide-react";
import type { ResumeSection } from "@/lib/resumeTemplates/types";

interface EditorProps {
  sections: ResumeSection[];
  // Accepts a plain array OR a React-style updater over the latest sections.
  // Every mutator below uses the updater form -- closing over the `sections`
  // prop directly let two edits in quick succession (e.g. typing into an
  // Experience field then an Education field before this component
  // re-rendered with fresh props) silently drop the first one, since the
  // second mutation's `sections.map(...)` still read the pre-first-edit
  // array. Reproduced live via scripted rapid field edits.
  setSections: (sections: ResumeSection[] | ((prev: ResumeSection[]) => ResumeSection[])) => void;
}

export default function Editor({ sections, setSections }: EditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Don't trigger drag on small moves/clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === active.id);
        const newIndex = prev.findIndex((s) => s.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const updateSection = (id: string, updated: ResumeSection) => {
    setSections((prev) => prev.map(s => s.id === id ? updated : s));
  };

  const deleteSection = (id: string) => {
    if (confirm("Remove this entire section?")) {
      setSections((prev) => prev.filter(s => s.id !== id));
    }
  };

  const toggleSection = (id: string) => {
    setSections((prev) => prev.map(s => s.id === id ? { ...s, isExpanded: !s.isExpanded } : s));
  };

  const duplicateSection = (id: string) => {
    const copyId = `copy-${Date.now()}`;
    setSections((prev) => {
      const section = prev.find(s => s.id === id);
      if (!section) return prev;
      const index = prev.findIndex(s => s.id === id);
      const newSection: ResumeSection = { ...JSON.parse(JSON.stringify(section)), id: copyId, isExpanded: true };
      const newSections = [...prev];
      newSections.splice(index + 1, 0, newSection);
      return newSections;
    });
  };

  const addSection = (type: ResumeSection["type"], title: string) => {
    const id = `${type.toLowerCase()}-${Date.now()}`;

    let newSection: ResumeSection;
    switch (type) {
      case "SUMMARY":
        newSection = { id, type, title, isExpanded: true, data: { content: "" } };
        break;
      case "LIST":
        newSection = { id, type, title, isExpanded: true, lastId: 1, items: [{ id: "1", title: "", subtitle: "", date: "", content: "" }] };
        break;
      case "TAGS":
        newSection = { id, type, title, isExpanded: true, items: [""] };
        break;
      case "LANGUAGES":
        newSection = { id, type, title, isExpanded: true, lastId: 1, items: [{ id: "1", language: "", level: "B1" }] };
        break;
      case "PERSONAL":
        // Not reachable from the add-section UI (there's always exactly
        // one PERSONAL section, seeded by default) -- exhaustive case only.
        return;
    }

    setSections((prev) => [...prev, newSection]);
  };

  return (
    <div className="space-y-6 pb-20">
      <DndContext 
        id="resume-builder-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext 
          items={sections.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <SortableSection 
              key={section.id} 
              section={section} 
              onUpdate={(updated) => updateSection(section.id, updated)}
              onToggle={() => toggleSection(section.id)}
              onDelete={() => deleteSection(section.id)}
              onDuplicate={() => duplicateSection(section.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add Section Trigger Area */}
      <div className="flex flex-col items-center py-10 border-2 border-dashed border-slate-200 rounded-3xl group hover:border-brand-blue/40 transition-all bg-white/50">
         <div className="flex flex-wrap justify-center gap-3 px-6">
            <button 
              onClick={() => addSection("LIST", "Work Experience")}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-blue hover:border-brand-blue/30 transition-all shadow-sm"
            >
              + Experience
            </button>
            <button 
              onClick={() => addSection("LIST", "Projects")}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-blue hover:border-brand-blue/30 transition-all shadow-sm"
            >
              + Projects
            </button>
            <button
              onClick={() => addSection("TAGS", "Certifications")}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-blue hover:border-brand-blue/30 transition-all shadow-sm"
            >
              + Certifications
            </button>
            <button
              onClick={() => addSection("LANGUAGES", "Language Skills")}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-blue hover:border-brand-blue/30 transition-all shadow-sm"
            >
              + Languages
            </button>
            <button 
              onClick={() => addSection("SUMMARY", "Achievements")}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-blue hover:border-brand-blue/30 transition-all shadow-sm"
            >
              + Achievements
            </button>
            <button 
              onClick={() => addSection("SUMMARY", "Custom Section")}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-blue hover:border-brand-blue/30 transition-all shadow-sm"
            >
              + Custom
            </button>
         </div>
         <p className="mt-6 text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] opacity-40">Extend Your Professional Narrative</p>
      </div>
    </div>
  );
}
