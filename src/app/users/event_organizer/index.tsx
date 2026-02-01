import { useLocalSearchParams } from "expo-router";
import EventOrganizerActivities from "./event_organizer_activities";
import EventOrganizerHome from "./event_organizer_home";
import EventOrganizerProfile from "./event_organizer_profile";
import EventOrganizerReviewCenter from "./event_organizer_review_center";

export default function EventOrganizerIndex() {
  const params = useLocalSearchParams();
  const page = (params.page as string) || "home";

  switch (page) {
    case "activities":
      return <EventOrganizerActivities />;
    case "review":
      return <EventOrganizerReviewCenter />;
    case "profile":
      return <EventOrganizerProfile />;
    case "home":
    default:
      return <EventOrganizerHome />;
  }
}
