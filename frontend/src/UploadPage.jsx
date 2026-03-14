import {MainLayout} from "./MainLayout.jsx";
import {useActionState, useId, useState} from "react";

function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
    });
}

export function UploadPage({authToken}) {
    const fileId = useId();
    const [preview, setPreview] = useState(null);

    async function handleFileChange(event) {
        const file = event.target.files?.[0];
        if (!file) {
            setPreview("");
            return;
        }
        try {
            const dataUrl = await readAsDataURL(file);
            setPreview(dataUrl);
        } catch (e) {
            console.error(e);
            setPreview("");
        }
    }

    async function handleUpload(_prevResult, formData) {
        try {
            const response = await fetch("api/images", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return "";
        } catch (e) {
            setPreview("");
            return e instanceof Error ? e.message : String(e);
        }
    }

    const [result, formAction, isPending] = useActionState(handleUpload, "");

    return (
        <>
            <h2>Upload</h2>
            <form action={formAction}>
                <div>
                    <label htmlFor={fileId}>Choose image to upload: </label>
                    <input
                        id={fileId}
                        name="image"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        required
                        disabled={isPending}
                        onChange={handleFileChange}
                    />
                </div>
                <div>
                    <label>
                        <span>Image title: </span>
                        <input name="name" required/>
                    </label>
                </div>

                <div aria-live="polite">
                    {result && <p>{result}</p>}
                </div>

                <div> {/* Preview img element */}
                    <img style={{width: "20em", maxWidth: "100%"}} src={preview} alt=""/>
                </div>

                <input type="submit" value="Confirm upload"/>
            </form>
        </>
    );
}
