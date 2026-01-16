import { ActivityFragment } from "@/graphql/generated/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Activity } from "./Activity";

interface DraggableActivityProps {
  activity: ActivityFragment;
}

export function DraggableActivity({ activity }: DraggableActivityProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        onClick={(e) => {
          // Stop drag if clicking on interactive elements
          const target = e.target as HTMLElement;
          if (
            target.closest("button") ||
            target.closest("a") ||
            target.closest('[role="button"]')
          ) {
            e.stopPropagation();
          }
        }}
      >
        <Activity activity={activity} withGridCol={false} />
      </div>
    </div>
  );
}
