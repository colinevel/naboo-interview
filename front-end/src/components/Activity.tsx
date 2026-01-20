import { ActivityFragment } from "@/graphql/generated/types";
import { useGlobalStyles } from "@/utils";
import { ActionIcon, Badge, Button, Card, Grid, Group, Image, Text } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import Link from "next/link";
import { useFavoriteActivity } from "@/hooks";

interface ActivityProps {
  activity: ActivityFragment;
  withGridCol?: boolean;
}

export function Activity({ activity, withGridCol = true }: ActivityProps) {
  const { classes } = useGlobalStyles();
  const { isFavorite, isLoading, isAuthenticated, handleToggleFavorite } =
    useFavoriteActivity(activity.id);

  const cardContent = (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Image
            src="https://dummyimage.com/480x4:3"
            height={160}
            alt="random image of city"
          />
        </Card.Section>

        <Group position="apart" mt="md" mb="xs">
          <Text weight={500} className={classes.ellipsis}>
            {activity.name}
          </Text>
          <ActionIcon
            variant="subtle"
            color={isFavorite ? "red" : "gray"}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(e);
            }}
            disabled={isLoading || !isAuthenticated}
            loading={isLoading}
          >
            {isFavorite ? (
              <IconHeartFilled size={20} />
            ) : (
              <IconHeart size={20} />
            )}
          </ActionIcon>
        </Group>

        <Group mt="md" mb="xs">
          <Badge color="pink" variant="light">
            {activity.city}
          </Badge>
          <Badge color="yellow" variant="light">
            {`${activity.price}€/j`}
          </Badge>
        </Group>

        <Text size="sm" color="dimmed" className={classes.ellipsis}>
          {activity.description}
        </Text>

        <Link href={`/activities/${activity.id}`} className={classes.link}>
          <Button variant="light" color="blue" fullWidth mt="md" radius="md">
            Voir plus
          </Button>
        </Link>
      </Card>
  );

  if (withGridCol) {
    return (
      <Grid.Col span={4}>
        {cardContent}
      </Grid.Col>
    );
  }

  return cardContent;
}
