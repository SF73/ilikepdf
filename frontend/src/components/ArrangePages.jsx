import React, { useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const PageCard = ({ page, index, onDelete, onMove, isSelected, onSelect }) => {
  const ref = useRef();

  const [, drop] = useDrop({
    accept: 'CARD',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        onMove(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative border p-2 ${isDragging ? 'opacity-50' : ''} ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}
      onClick={() => onSelect(index)}
      style={{ cursor: 'move' }}
    >
      <img src={page.url} alt={`Page ${page.pageIndex}`} className="w-full h-auto" />
      <button
        className="absolute opacity-10 transition-opacity duration-300 ease-in-out hover:opacity-100 top-1 right-1 bg-red-500 text-white rounded-full p-1 size-6 text-xs"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(index);
        }}
      >
        ✕
      </button>
      <div className="mt-2 text-center text-sm font-medium">
        Page {page.pageIndex}
      </div>
    </div>
  );
};

const ArrangePages = ({ initialPages }) => {
  const [pages, setPages] = useState(initialPages);
  const [history, setHistory] = useState([initialPages.map((_, idx) => idx + 1)]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleDelete = (index) => {
    const newPages = pages.filter((_, i) => i !== index);
    const newOrder = history[history.length - 1].filter((_, i) => i !== index);
    setPages(newPages);
    setHistory([...history, newOrder]);
  };

  const handleMove = (fromIndex, toIndex) => {
    const newPages = [...pages];
    const [movedPage] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, movedPage);

    const newOrder = [...history[history.length - 1]];
    const [movedIndex] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedIndex);

    setPages(newPages);
    setHistory([...history, newOrder]);
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const lastOrder = newHistory[newHistory.length - 1];
      setPages(lastOrder.map((idx) => initialPages[idx - 1]));
      setHistory(newHistory);
    }
  };

  const handleSelect = (index) => {
    setSelectedIndex(index === selectedIndex ? null : index);
  };

  return (
    <div>
      <button
        className="btn disabled:bg-gray-300"
        onClick={handleUndo}
        disabled={history.length <= 1}
      >
        Undo
      </button>
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {pages.map((page, index) => (
            <PageCard
              key={index}
              page={page}
              index={index}
              onDelete={handleDelete}
              onMove={handleMove}
              isSelected={selectedIndex === index}
              onSelect={handleSelect}
              history={history}
            />
          ))}
        </div>
      </DndProvider>
    </div>
  );
};

export default ArrangePages;
