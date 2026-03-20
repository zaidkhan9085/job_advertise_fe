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

interface EditorProps {
  sections: any[];
  setSections: (sections: any[]) => void;
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
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      setSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const updateSection = (id: string, newData: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...newData } : s));
  };

  const deleteSection = (id: string) => {
    if (confirm("Remove this entire section?")) {
      setSections(sections.filter(s => s.id !== id));
    }
  };

  const toggleSection = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, isExpanded: !s.isExpanded } : s));
  };

  const duplicateSection = (id: string) => {
    const section = sections.find(s => s.id === id);
    if (!section) return;
    const index = sections.findIndex(s => s.id === id);
    const newSection = { ...JSON.parse(JSON.stringify(section)), id: `copy-${Date.now()}`, isExpanded: true };
    const newSections = [...sections];
    newSections.splice(index + 1, 0, newSection);
    setSections(newSections);
  };

  const addSection = (type: string, title: string) => {
    const id = `${type.toLowerCase()}-${Date.now()}`;
    const newSection: any = {
      id,
      type,
      title,
      isExpanded: true,
    };

    if (type === "SUMMARY") newSection.data = { content: "" };
    if (type === "LIST") {
      newSection.data = {};
      newSection.lastId = 1;
      newSection.items = [{ id: "1", title: "", subtitle: "", date: "", content: "" }];
    }
    if (type === "TAGS") newSection.items = [""];

    setSections([...sections, newSection]);
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
              onUpdate={(data: any) => updateSection(section.id, data)}
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
