import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Theme } from "../../../constants/theme";
import { supabase } from "../../services/supabase";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Show splash screen for minimum 2 seconds for branding
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if there's an active session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Splash screen - Session check:', { hasSession: !!session?.user, error });
        
        if (error) {
          console.error('Session check error:', error);
          // If there's an error, clear the session to prevent auth loops
          await supabase.auth.signOut();
          console.log('Navigating to landing_screen (error)');
          router.replace("/public/landing_screen");
          return;
        }

        if (session?.user) {
          // User is logged in, check their role
          try {
            // Query by email instead of auth_id (using email-based lookup system)
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('user_role')
              .eq('email', session.user.email?.toLowerCase() || '')
              .single();

            if (userError && userError.code !== 'PGRST116') {
              throw userError;
            }

            const userRole = userData?.user_role;
            console.log('User role:', userRole);

            // Route based on user role
            if (userRole === 'event_organizer') {
              console.log('Navigating to event organizer home');
              router.replace("/users/event_organizer");
            } else if (userRole === 'venue_administrator') {
              console.log('Navigating to venue administrator home');
              router.replace("/users/venue_administrator");
            } else if (userRole === 'coordinator') {
              console.log('Navigating to coordinator home');
              router.replace("/users/coordinator");
            } else if (userRole === 'customer') {
              console.log('Navigating to customer home');
              router.replace("/users/customer");
            } else {
              console.log('Unknown role, navigating to users for routing');
              router.replace("/users");
            }
          } catch (roleError) {
            console.error('Error fetching user role:', roleError);
            // Navigate to /users and let the index.tsx handle the routing
            router.replace("/users");
          }
        } else {
          // No active session, go to landing page
          console.log('No session, navigating to landing_screen');
          router.replace("/public/landing_screen");
        }
      } catch (error) {
        console.error('Unexpected error during session check:', error);
        // Clear any invalid session data
        await supabase.auth.signOut();
        console.log('Navigating to landing_screen (catch)');
        router.replace("/public/landing_screen");
      }
    };

    checkSession();
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../../../assets/images/WeekenderEventLogo.png")}
        style={styles.logo}
      />

      {/* Optional text */}
      <Text style={styles.text}>Weekender Events</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: Theme.spacing.lg, // space between logo and text
  },
  text: {
    fontSize: 32,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
});
