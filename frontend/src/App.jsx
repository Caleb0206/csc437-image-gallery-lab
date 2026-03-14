import {AllImages} from "./images/AllImages.jsx";
import {ImageDetails} from "./images/ImageDetails.jsx";
import {UploadPage} from "./UploadPage.jsx";
import {LoginPage} from "./LoginPage.jsx";
import {ProtectedRoute} from "./ProtectedRoute.jsx";
import {BrowserRouter, Routes, Route} from "react-router";
import {MainLayout} from "./MainLayout.jsx";
import {useState} from "react";

function App() {
    const [authToken, setAuthToken] = useState("");

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout/>}>

                    <Route
                        index
                        element={
                            <ProtectedRoute authToken={authToken}>
                                <AllImages authToken={authToken}/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="images/:imageId"
                        element={
                            <ProtectedRoute authToken={authToken}>
                                <ImageDetails authToken={authToken}/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="upload"
                        element={
                            // <ProtectedRoute authToken={authToken}>
                            <UploadPage authToken={authToken}/>
                            // </ProtectedRoute>
                        }/>
                    <Route path="login"
                           element={<LoginPage key={"login"} isRegistering={false} onAuthToken={setAuthToken}/>}/>
                    <Route path="register"
                           element={<LoginPage key={"register"} isRegistering={true} onAuthToken={setAuthToken}/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App;
