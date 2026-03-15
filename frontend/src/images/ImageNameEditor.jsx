import {useState} from "react";
import "./Images.css";

export function ImageNameEditor({imageId, initialValue, onRenameSuccess, authToken}) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(initialValue || "");

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    function handleEditPressed() {
        setIsEditingName(true);
        setNameInput(initialValue || "");
        setError("");
    }

    async function handleSubmitPressed() {
        setError("");
        setIsSaving(true);

        try {
            const response = await fetch(`/api/images/${imageId}/name`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({name: nameInput}),
            })
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("You do not own this image.");
                }
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            setIsEditingName(false);
            onRenameSuccess?.(nameInput);
        } catch (e) {
            console.error(e);
            alert(e instanceof Error ? e.message : String(e));
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setIsSaving(false);
        }
    }

    if (isEditingName) {
        return (
            <div style={{margin: "1em 0"}}>
                <div aria-live="polite">
                    {isSaving && <p>Renaming image...</p>}
                    {error !== "" && <p className="image-upload-error">{error}</p>}
                </div>
                <label>
                    New Name
                    <input
                        required
                        style={{marginLeft: "0.5em"}}
                        value={nameInput}
                        placeholder={initialValue}
                        onChange={e => setNameInput(e.target.value)}
                        disabled={isSaving}
                    />
                </label>
                <button
                    disabled={isSaving || nameInput.trim().length === 0}
                    onClick={handleSubmitPressed}
                >
                    Submit
                </button>
                <button disabled={isSaving} onClick={() => setIsEditingName(false)}>Cancel</button>
            </div>
        );
    } else {
        return (
            <div style={{margin: "1em 0"}}>
                <div aria-live="polite">
                    {error !== "" && <p className="image-upload-error">{error}</p>}
                </div>
                <button onClick={handleEditPressed}>Edit name</button>
            </div>
        );
    }
}