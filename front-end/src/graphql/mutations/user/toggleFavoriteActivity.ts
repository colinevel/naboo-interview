import gql from "graphql-tag";

const ToggleFavoriteActivity = gql`
  mutation ToggleFavoriteActivity($activityId: ID!) {
    toggleFavoriteActivity(activityId: $activityId)
  }
`;

export default ToggleFavoriteActivity;
