import { useState, useEffect } from "react";
import { MainLayout } from "../MainLayout.jsx";
import { fetchById } from "./ImageFetcher.js";
import { useParams } from "react-router";

export function ImageDetails() {
    const { imageId } = useParams();
    const [image, _setImage] = useState(fetchById(imageId));
    const [loading, _setLoading] = useState(true);
    const [error, _setError] = useState("");

    useEffect(() => {
        async function doFetch() {
            try {
                const response = await fetch("/api/images");

                if (!response.ok) {
                    throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);

                }

                const images = await response.json();

                if (!Array.isArray(images)) {
                    throw new Error("Error: Response JSON was not an array");
                }

                const found = 
                    images.find((img) => String(img.id) === String(imageId)) || null;

                _setImage(found);
                _setError("");
            } catch (e) {
                _setError(e instanceof Error ? e.message : String(e));
                setImage(null);
            } finally {
                _setLoading(false);
            }
        }
        doFetch();
    }, []);



    return (
        <>
            {loading && <p>Loading...</p>}
            {!loading && error !== "" && <p>{error}</p>}
            {!loading && error === "" && !image && <h2>Image not found</h2>}

            {!loading && error === "" && image && (
                <>
                    <h2>{image.name}</h2>
                    <p>By {image.author.username}</p>
                    <img className="ImageDetails-img" src={image.src} alt={image.name} />
                </>

            )}


        </>
    )
}
