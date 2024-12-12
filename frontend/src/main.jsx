import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient,QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
// import ErrorBoundary from './components/ErrorBoundry.jsx'
import ChatProvider from './context/ChatProvider.jsx'

const queryClient = new QueryClient({
  defaultOptions:{
    queries:{
      
    }
  }
})

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
            <ChatProvider>
              {/* <ErrorBoundary> */}
              <App />
              {/* </ErrorBoundary> */}
            </ChatProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
