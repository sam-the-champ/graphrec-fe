import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AppRoutes } from '@/routes/AppRoutes';

// Intentionally NOT wrapping <AppRoutes /> in a single padded container:
// LandingPage manages its own full-bleed hero section width internally,
// so a global max-width/padding wrapper here would clip it. Each other
// page applies its own `container-page` padding at its root instead —
// see DashboardPage, TutorialsPage, TutorialDetailsPage, ProfilePage.
function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default App;
