import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/common/ErrorBoundary";
import OfflineStatus from "./components/common/OfflineStatus";

function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
      <OfflineStatus />
    </ErrorBoundary>
  );
}

export default App;