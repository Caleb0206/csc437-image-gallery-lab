import express from "express";
import {getEnvVar} from "../getEnvVar.js";
import jwt from "jsonwebtoken";

/**
 * Creates a Promise for a JWT token, with a specified username embedded inside.
 *
 * @param username the username to embed in the JWT token
 * @return a Promise for a JWT
 */
function generateAuthToken(username) {
    return new Promise((resolve, reject) => {
        const payload = {
            username
        };
        jwt.sign(
            payload,
            getEnvVar("JWT_SECRET"),
            {expiresIn: "1d"},
            (error, token) => {
                if (error) reject(error);
                else resolve(token);
            }
        );
    });
}

export function registerAuthRoutes(app, credentialsProvider) {

    app.post("/api/users", async (req, res) => {
        try {
            const username = req.body?.username;
            const email = req.body?.email;
            const password = req.body?.password;

            if (
                typeof username !== "string" ||
                typeof email !== "string" ||
                typeof password !== "string"
            ) {
                return res.status(400).send({
                    error: "Bad request",
                    message: "Missing username, email, or password",
                });
            }
            // return res.status(200).send({ username, email, password });

            const created = await credentialsProvider.registerUser(
                username.trim(),
                email.trim(),
                password
            );

            if (!created) {
                return res.status(409).send({
                    error: "Conflict",
                    message: "Username already exists",
                });
            }
            const token = await generateAuthToken(username.trim());
            return res.status(201).send({token});
        } catch (e) {
            return res.status(500).json({
                error: e instanceof Error ? e.message : String(e),
            });
        }
    });
    app.post("/api/auth/tokens", async (req, res) => {
        try {
            const username = req.body?.username;
            const password = req.body?.password;

            if (typeof username !== "string" || typeof password !== "string") {
                return res.status(400).send({
                    error: "Bad request",
                    message: "Missing username or password",
                });
            }
            const ok = await credentialsProvider.verifyPassword(username, password);
            if (!ok) {
                return res.status(401).send({
                    error: "Unauthorized",
                    message: "Invalid username or password",
                });
            }
            const token = await generateAuthToken(username);
            return res.status(200).send({token});
        } catch (e) {
            return res.status(500).json({error: e instanceof Error ? e.message : String(e)});
        }
    })
}