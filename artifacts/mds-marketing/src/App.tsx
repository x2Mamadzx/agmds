import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { useEffect } from 'react';
import Home from '@/pages/Home';
import Admin from '@/pages/Admin';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Reserver from '@/pages/Reserver';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/admin" component={Admin} />
        <Route path="/politique-de-confidentialite" component={PrivacyPolicy} />
        <Route path="/reserver-appel" component={Reserver} />
        <Route>
          <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
            <h1 className="text-2xl font-display font-bold">404 - Page Non Trouvée</h1>
          </div>
        </Route>
      </Switch>
    </>
  );
}

function AppShell() {
  const [location] = useLocation();
  const isStandalone = location === '/reserver-appel';

  if (isStandalone) {
    return (
      <div className="min-h-screen flex flex-col overflow-x-hidden">
        <Router />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1">
        <Router />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AppShell />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
