import gql from "graphql-tag";
import ActivityFragment from "@/graphql/fragments/activity";

const ToggleFavoriteActivity = gql`
  mutation ToggleFavoriteActivity($activityId: ID!) {
    toggleFavoriteActivity(activityId: $activityId) {
      id
      firstName
      lastName
      email
      favoriteActivities {
        ...Activity
      }
    }
  }
  ${ActivityFragment}
`;

export default ToggleFavoriteActivity;
