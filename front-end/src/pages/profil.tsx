import { Activity, EmptyData, PageTitle } from "@/components";
import { withAuth } from "@/hocs";
import { useAuth } from "@/hooks";
import { GetUserQuery, GetUserQueryVariables } from "@/graphql/generated/types";
import GetUser from "@/graphql/queries/auth/getUser";
import { useQuery } from "@apollo/client";
import { Avatar, Flex, Grid, Text, Title } from "@mantine/core";
import Head from "next/head";

const Profile = () => {
  const { user: authUser } = useAuth();

  const { data: userData } = useQuery<GetUserQuery, GetUserQueryVariables>(
    GetUser,
    {
      skip: !authUser,
      fetchPolicy: "cache-and-network",
    }
  );

  const user = userData?.getMe;
  const favoriteActivities = user?.favoriteActivities || [];

  return (
    <>
      <Head>
        <title>Mon profil | CDTR</title>
      </Head>
      <PageTitle title="Mon profil" />
      <Flex align="center" gap="md" mb="xl">
        <Avatar color="cyan" radius="xl" size="lg">
          {user?.firstName[0]}
          {user?.lastName[0]}
        </Avatar>
        <Flex direction="column">
          <Text>{user?.email}</Text>
          <Text>{user?.firstName}</Text>
          <Text>{user?.lastName}</Text>
        </Flex>
      </Flex>
      <Title order={3} mb="md">Mes activités favorites</Title>
      {favoriteActivities.length > 0 ? (
        <Grid>
          {favoriteActivities.map((activity) => (
            <Activity activity={activity} key={activity.id} />
          ))}
        </Grid>
      ) : (
        <EmptyData />
      )}
    </>
  );
};

export default withAuth(Profile);
