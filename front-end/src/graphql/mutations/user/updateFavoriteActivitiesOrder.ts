import gql from "graphql-tag";
import ActivityFragment from "@/graphql/fragments/activity";

const UpdateFavoriteActivitiesOrder = gql`
  mutation UpdateFavoriteActivitiesOrder($activityIds: [ID!]!) {
    updateFavoriteActivitiesOrder(activityIds: $activityIds) {
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

export default UpdateFavoriteActivitiesOrder;
