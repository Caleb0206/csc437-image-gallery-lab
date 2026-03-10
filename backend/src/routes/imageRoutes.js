import express from "express";
import { ObjectId } from "mongodb";

const MAX_NAME_LENGTH = 100;
export function registerImageRoutes(app, imageProvider) {
    function waitDuration(numMs) {
        return new Promise(resolve => setTimeout(resolve, numMs));
    }

    app.get("/api/images", async (req, res) => {
        try {
            await waitDuration(1000);
            const images = await imageProvider.getAllImages();
            res.json(images);
        } catch (e) {
            res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
        }
    });
    app.get("/api/images/:imageId", async (req, res) => {
        try {
            const { imageId} = req.params;

            if (!ObjectId.isValid(imageId)) {
                return res.status(404).send({ error: "Not Found", message: "No image with that ID"});
            }
            const image = await imageProvider.getOneImage(imageId);
            if (!image) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "No image with that ID",
                });
            }
            res.json(image);
        } catch (e) {
            res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
        }
    });
    app.patch("/api/images/:imageId/name", async (req, res) => {
        try {
            await waitDuration(1000);
            const { imageId } = req.params;
            if (!ObjectId.isValid(imageId)) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist",
                })
            }

            const loggedInUsername = req.userInfo?.username;
            if (typeof loggedInUsername !== "string") {
                return res.status(401).end();
            }

            const ownerUsername = await imageProvider.getImageOwnerUsername(imageId);
            if (!ownerUsername) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist",
                });
            }
            if (ownerUsername !== loggedInUsername) {
                return res.status(403).send({
                    error: "Forbidden",
                    message: "This user does not own this image",
                });
            }

            const newName = req.body?.name;
            if (typeof newName !== "string") {
                return res.status(400).send({
                    error: "Bad Request",
                    message: 'Request body must be JSON with a string field "name"'
                });
            }
            const trimmed = newName.trim();
            if ( trimmed.length === 0) {
                return res.status(400).send({
                    error: "Bad Request",
                    message: 'Field "name" must not be empty',
                });
            }
            if ( trimmed.length > MAX_NAME_LENGTH) {
                return res.status(413).send({
                    error: "Content Too Large",
                    message: `Image name exceeds ${MAX_NAME_LENGTH} characters`,
                });
            }
            const matchedCount = await imageProvider.updateImageName(imageId, trimmed);

            if (matchedCount === 0) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist",
                });
            }
            return res.status(204).send();
        } catch (e) {
            return res.status(500).json({ error: e instanceof Error ? e.message : String(e)});
        }
    })
}