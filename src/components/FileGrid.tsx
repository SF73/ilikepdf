// import React, { useState, useEffect } from "react";
import MemoizedFileCard from "./MemoizedFileCard";
import { FileMetadata } from "@/types/fileTypes";
import { DndContext,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
     } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";

export function FileGrid({
    files,
    onDelete,
    onReorder,
    onPageRangeChange,
  }: {
    files: FileMetadata[];
    onDelete: (id: string) => void;
    onReorder: (newFiles: FileMetadata[]) => void;
    onPageRangeChange?: (id: string, start: number | null, end: number | null) => void;
  }) {
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
    );
    function handleDragEnd(event: any) {
        const { active, over } = event;
    
        if (active.id !== over.id) {
          const oldIndex = files.findIndex(file => file.id === active.id);
          const newIndex = files.findIndex(file => file.id === over.id);
    
          const reordered = arrayMove(files, oldIndex, newIndex);
          onReorder(reordered);
        }
      }

    return (

        <DndContext
        sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={files.map(file => file.id)}
      >
        <div className="flex flex-wrap gap-4 justify-center">
        {files.map((file) => (
                <MemoizedFileCard
                key={file.id}
                file={file}
                onDelete={onDelete ? () => onDelete(file.id) : undefined}
                onPageRangeChange={onPageRangeChange ? (start, end) => onPageRangeChange(file.id, start, end) : undefined}
                />))}
        </div>
        </SortableContext>
        </DndContext>
    );

} 