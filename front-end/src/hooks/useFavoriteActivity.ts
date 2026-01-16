import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "./useAuth";
import { GetUserQuery, GetUserQueryVariables } from "@/graphql/generated/types";
import GetUser from "@/graphql/queries/auth/getUser";
import ToggleFavoriteActivity from "@/graphql/mutations/user/toggleFavoriteActivity";
import { ActivityFragment } from "@/graphql/generated/types";

export function useFavoriteActivity(activityId: string) {
  const { user: authUser } = useAuth();

  // Query user data to check favorite status
  const { data: userData } = useQuery<GetUserQuery, GetUserQueryVariables>(
    GetUser,
    {
      skip: !authUser,
      fetchPolicy: "cache-and-network",
    }
  );

  const user = userData?.getMe;
  const isFavorite =
    user?.favoriteActivities?.some((fav) => fav?.id === activityId) ?? false;

  const [toggleFavorite, { loading }] = useMutation(ToggleFavoriteActivity, {
    refetchQueries: [{ query: GetUser }],
    awaitRefetchQueries: true,
  });

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!authUser) return;

    try {
      await toggleFavorite({
        variables: { activityId },
      });
    } catch (error) {
      console.error("Error toggling favorite activity", error);
    }
  };

  return {
    isFavorite,
    isLoading: loading,
    isAuthenticated: !!authUser,
    handleToggleFavorite,
  };
}
