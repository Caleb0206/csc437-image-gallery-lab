import {useState, useEffect} from "react";
import {MainLayout} from "../MainLayout.jsx";
import {ImageGrid} from "./ImageGrid.jsx";

export function AllImages({authToken}) {
    const [imageData, _setImageData] = useState([]);
    const [loading, _setLoading] = useState(true);
    const [error, _setError] = useState("");

    useEffect(() => {
        // fetch("/api/images")
        async function doFetch() {
            try {
                const response = await fetch("/api/images", {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);

                }

                const images = await response.json();

                if (!Array.isArray(images)) {
                    throw new Error("Error: Response was not an array");
                }

                _setImageData(images);
                _setError("");
            } catch (e) {
                _setError(e instanceof Error ? e.message : String(e));
            } finally {
                _setLoading(false);
            }
        }

        doFetch();
    }, [authToken]);
    return (

        <>
            <h2>All Images</h2>

            {loading && <p>Loading...</p>}
            {!loading && error !== "" && (
                <p>{error}</p>
            )}
            {!loading && error === "" && (
                <ImageGrid images={imageData}/>

            )}
        </>


    );
}
