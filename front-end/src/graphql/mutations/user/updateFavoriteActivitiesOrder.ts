import gql from "graphql-tag";

const UpdateFavoriteActivitiesOrder = gql`
  mutation UpdateFavoriteActivitiesOrder($activityIds: [ID!]!) {
    updateFavoriteActivitiesOrder(activityIds: $activityIds)
  }
`;

export default UpdateFavoriteActivitiesOrder;
