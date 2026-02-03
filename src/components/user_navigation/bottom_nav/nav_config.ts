/**
 * Bottom Navigation Configuration
 * Define navigation items for each user role here.
 * Add/remove roles and items without touching UI code.
 */

export interface NavItem {
  id: string;
  label: string;
  iconOutline: string;
  iconFilled: string;
  page: string;
}

export type UserRole = "customer" | "event_organizer" | "coordinator" | "venue_administrator" | "admin";

export const NAV_CONFIG: Record<UserRole, NavItem[]> = {
  customer: [
    {
      id: "home",
      label: "Home",
      iconOutline: "home-outline",
      iconFilled: "home",
      page: "home",
    },
    {
      id: "templates",
      label: "Templates",
      iconOutline: "document-text-outline",
      iconFilled: "document-text",
      page: "templates",
    },
    {
      id: "my_edit",
      label: "My Edit",
      iconOutline: "pencil-outline",
      iconFilled: "pencil",
      page: "my_edit",
    },
    {
      id: "my_event",
      label: "My Event",
      iconOutline: "checkmark-circle-outline",
      iconFilled: "checkmark-circle",
      page: "my_event",
    },
    {
      id: "profile",
      label: "Profile",
      iconOutline: "person-outline",
      iconFilled: "person",
      page: "profile",
    },
  ],

  event_organizer: [
    {
      id: "home",
      label: "Home",
      iconOutline: "grid-outline",
      iconFilled: "grid",
      page: "home",
    },
    {
      id: "activities",
      label: "Activities",
      iconOutline: "calendar-number-outline",
      iconFilled: "calendar-number",
      page: "activities",
    },
    {
      id: "review",
      label: "Reviews",
      iconOutline: "list-outline",
      iconFilled: "list",
      page: "review",
    },
    {
      id: "settings",
      label: "Settings",
      iconOutline: "settings-outline",
      iconFilled: "settings",
      page: "settings",
    },
  ],

  coordinator: [
    {
      id: "home",
      label: "Home",
      iconOutline: "home-outline",
      iconFilled: "home",
      page: "home",
    },
    {
      id: "calendar",
      label: "Calendar",
      iconOutline: "calendar-outline",
      iconFilled: "calendar",
      page: "calendar",
    },
    {
      id: "projects",
      label: "Projects",
      iconOutline: "project-outline",
      iconFilled: "project",
      page: "projects",
    },
    {
      id: "profile",
      label: "Profile",
      iconOutline: "person-outline",
      iconFilled: "person",
      page: "profile",
    },
  ],

  venue_administrator: [
    {
      id: "home",
      label: "Home",
      iconOutline: "grid-outline",
      iconFilled: "grid",
      page: "home",
    },
    {
      id: "dashboard",
      label: "Venue Dashboard",
      iconOutline: "calendar-outline",
      iconFilled: "calendar",
      page: "venue_dashboard",
    },
    {
      id: "my_venue",
      label: "My Venue",
      iconOutline: "eye-outline",
      iconFilled: "eye",
      page: "my_venue",
    },
    {
      id: "profile",
      label: "Profile",
      iconOutline: "person-outline",
      iconFilled: "person",
      page: "profile",
    },
  ],

  admin: [
    {
      id: "home",
      label: "Home",
      iconOutline: "home-outline",
      iconFilled: "home",
      page: "home",
    },
    {
      id: "users",
      label: "Users",
      iconOutline: "people-outline",
      iconFilled: "people",
      page: "users",
    },
    {
      id: "analytics",
      label: "Analytics",
      iconOutline: "bar-chart-outline",
      iconFilled: "bar-chart",
      page: "analytics",
    },
    {
      id: "settings",
      label: "Settings",
      iconOutline: "settings-outline",
      iconFilled: "settings",
      page: "settings",
    },
    {
      id: "profile",
      label: "Profile",
      iconOutline: "person-outline",
      iconFilled: "person",
      page: "profile",
    },
  ],
};
