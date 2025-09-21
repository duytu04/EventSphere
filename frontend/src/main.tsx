

// import React from "react";
// import ReactDOM from "react-dom/client";
// import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import { Provider } from "react-redux";                 // <-- thêm
// import { store } from "./store";                         // <-- thêm
// import App from "./App";

// const router = createBrowserRouter([{ path: "/*", element: <App/> }]);

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <Provider store={store}>                              {/* <-- bọc Redux */}
//       <RouterProvider router={router} />
//     </Provider>
//   </React.StrictMode>
// );


// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import ColorModeProvider from "./theme/theme";
import { SnackbarProvider } from "notistack";

// router cơ bản, App sẽ xử lý route con
const router = createBrowserRouter([{ path: "/*", element: <App /> }]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ColorModeProvider>
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={2500}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <RouterProvider router={router} />
        </SnackbarProvider>
      </ColorModeProvider>
    </Provider>
  </React.StrictMode>
);
