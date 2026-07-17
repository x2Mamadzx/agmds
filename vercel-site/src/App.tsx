import React from "react";
import { Route, Switch, useLocation } from "wouter";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import Home from "./pages/Home";
import Reserver from "./pages/Reserver";
import Admin from "./pages/Admin";
import PrivacyPolicy from "./pages/PrivacyPolicy";

export default function App() {
  const [location] = useLocation();
  const hideLayout = location === "/reserver-appel";

  return (
    <div className="min-h-screen">
      {!hideLayout && <Navbar />}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/reserver-appel" component={Reserver} />
        <Route path="/admin" component={Admin} />
        <Route path="/politique-de-confidentialite" component={PrivacyPolicy} />
        <Route>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-black mb-4">404</h1>
              <p className="text-black/60">Page introuvable</p>
              <a href="/" className="mt-6 inline-block text-primary hover:underline">
                Retour à l'accueil →
              </a>
            </div>
          </div>
        </Route>
      </Switch>
      {!hideLayout && <Footer />}
    </div>
  );
}
