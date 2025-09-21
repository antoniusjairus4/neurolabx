import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PhotosynthesisGame } from "@/components/games/PhotosynthesisGame";
import { CircuitBuilderGame } from "@/components/games/circuit/CircuitBuilderGame";
import { MathematicsGame } from "@/components/games/MathematicsGame";
import { TechnologyGame } from "@/components/games/TechnologyGame";
import { IoTSmartCityGameWrapper } from "@/components/games/IoTSmartCityGameWrapper";
import { SQLDataDungeonGameWrapper } from "@/components/games/SQLDataDungeonGameWrapper";
import { LogicGateSimulatorClass6Wrapper } from "@/components/games/LogicGateSimulatorClass6Wrapper";
import { TechnologyGameSelectorWrapper } from "@/components/games/TechnologyGameSelectorWrapper";
import { OrganicReactionBuilderGame } from "@/components/games/OrganicReactionBuilderGame";
import { ProbabilityKingdomGame } from "@/components/games/mathematics/ProbabilityKingdomGame";
import { DisasterResilientCityGameWrapper } from "@/components/games/DisasterResilientCityGameWrapper";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/learning/science" element={<PhotosynthesisGame />} />
              <Route path="/learning/science/organic-reactions" element={<OrganicReactionBuilderGame />} />
              <Route path="/learning/engineering" element={<CircuitBuilderGame />} />
              <Route path="/learning/mathematics" element={<MathematicsGame />} />
              <Route path="/learning/mathematics/probability-kingdom" element={<ProbabilityKingdomGame />} />
              <Route path="/learning/technology" element={<TechnologyGameSelectorWrapper />} />
          <Route path="/learning/technology/iot-smart-city" element={<IoTSmartCityGameWrapper />} />
          <Route path="/learning/technology/sql-data-dungeon" element={<SQLDataDungeonGameWrapper />} />
          <Route path="/learning/technology/logic-gate-simulator-class6" element={<LogicGateSimulatorClass6Wrapper />} />
              <Route path="/learning/engineering/disaster-resilient-city" element={<DisasterResilientCityGameWrapper />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
