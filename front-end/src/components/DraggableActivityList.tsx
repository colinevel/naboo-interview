import { ActivityFragment, GetUserQuery } from "@/graphql/generated/types";
import { DraggableActivity, EmptyData } from "@/components";
import { useMutation } from "@apollo/client";
import UpdateFavoriteActivitiesOrder from "@/graphql/mutations/user/updateFavoriteActivitiesOrder";
import GetUser from "@/graphql/queries/auth/getUser";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Grid } from "@mantine/core";
import { useState, useEffect, useMemo } from "react";

interface DraggableActivityListProps {
  activities: ActivityFragment[];
}

export function DraggableActivityList({ activities }: DraggableActivityListProps) {
  const [items, setItems] = useState<string[]>([]);

  const activityIds = useMemo(
    () => activities.map((activity) => activity.id),
    [activities]
  );

  // Initialize items when activities change
  useEffect(() => {
    if (activityIds.length > 0) {
      setItems(activityIds);
    }
  }, [activityIds]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before starting drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [updateOrder] = useMutation(UpdateFavoriteActivitiesOrder, {
    update: (cache, { data }) => {
      if (data?.updateFavoriteActivitiesOrder) {
        cache.writeQuery<GetUserQuery>({
          query: GetUser,
          data: {
            getMe: data.updateFavoriteActivitiesOrder,
          },
        });
      }
    },
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const newItems = arrayMove(
        items,
        items.indexOf(active.id as string),
        items.indexOf(over.id as string)
      );

      // Optimistically update UI
      setItems(newItems);

      // Save order to backend
      try {
        await updateOrder({
          variables: { activityIds: newItems },
        });
      } catch (error) {
        console.error("Error updating favorite activities order", error);
        // Revert on error
        setItems(items);
      }
    }
  };

  const sortedActivities = items.length
    ? items
        .map((id) => activities.find((activity) => activity.id === id))
        .filter(
          (activity): activity is NonNullable<typeof activity> =>
            activity !== undefined
        )
    : activities;

  if (activities.length === 0) {
    return <EmptyData />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.length ? items : activityIds}
        strategy={rectSortingStrategy}
      >
        <Grid>
          {sortedActivities.map((activity) => (
            <Grid.Col key={activity.id} span={4}>
              <DraggableActivity activity={activity} />
            </Grid.Col>
          ))}
        </Grid>
      </SortableContext>
    </DndContext>
  );
}
