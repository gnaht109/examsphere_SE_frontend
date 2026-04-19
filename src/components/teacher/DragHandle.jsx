export default function DragHandle({ title, onDragStart, onDragEnd }) {
  return (
    <span
      className="drag-chip"
      title={title}
      draggable
      onDragStart={(event) => {
        event.stopPropagation();
        onDragStart(event);
      }}
      onDragEnd={(event) => {
        event.stopPropagation();
        onDragEnd?.(event);
      }}
    >
      Drag
    </span>
  );
}
