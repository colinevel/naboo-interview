import { useAuth } from "@/hooks";

// It is not a good practice to call directly handleLogout in the body of this component.
// It triggers infinite re-renders.
// We should call the function handleLogout on the click of the 'déconnection' button
export default function Logout() {
  const { handleLogout } = useAuth();
  handleLogout();
  return null;
}
