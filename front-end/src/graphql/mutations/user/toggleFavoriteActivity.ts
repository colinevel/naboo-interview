import gql from "graphql-tag";

const ToggleFavoriteActivity = gql`
  mutation ToggleFavoriteActivity($activityId: ID!) {
    toggleFavoriteActivity(activityId: $activityId) {
      id
      favoriteActivities {
        id
      }
    }
  }
`;

export default ToggleFavoriteActivity;
