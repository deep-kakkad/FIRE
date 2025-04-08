import React from "react";
import FIRECalculator from "./FIRECalculator";
import { Toaster } from "./ui/toaster";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <FIRECalculator />
      <Toaster />
    </div>
  );
};

export default Home;
