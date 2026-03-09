import { useState, useEffect } from "react";
import { MainLayout } from "../MainLayout.jsx";
import { useParams } from "react-router";
import {ImageNameEditor} from "./ImageNameEditor";

export function ImageDetails() {
    const { imageId } = useParams();

    const [image, _setImage] = useState(null);
    const [loading, _setLoading] = useState(true);
    const [error, _setError] = useState("");

    useEffect(() => {
        async function doFetch() {
            try {
                const response = await fetch(`/api/images/${imageId}`);

                if (!response.ok) {
                    throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                _setImage(result);
            } catch (e) {
                _setError(e instanceof Error ? e.message : String(e));
                _setImage(null);
            } finally {
                _setLoading(false);
            }
        }
        doFetch();
    }, [imageId]);



    return (
        <>
            {loading && <p>Loading...</p>}
            {!loading && error !== "" && <p>{error}</p>}
            {!loading && error === "" && !image && <h2>Image not found</h2>}

            {!loading && error === "" && image && (
                <>
                    <h2>{image.name}</h2>
                    <p>By {image.author.username}</p>
                    <ImageNameEditor
                        imageId={String(image._id)}
                        initialValue={image.name}
                        onRenameSuccess={(newName) => {
                            _setImage((prev) => {
                                if (!prev) return prev;
                                return { ...prev, name: newName };
                            })
                        }}
                    />
                    <img className="ImageDetails-img" src={image.src} alt={image.name} />
                </>

            )}


        </>
    )
}
