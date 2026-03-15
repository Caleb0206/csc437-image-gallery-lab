import React, {useActionState} from "react";
import {MainLayout} from "./MainLayout.jsx";
import "./LoginPage.css";
import {Link, useNavigate} from "react-router";

export function LoginPage({isRegistering, onAuthToken}) {
    const navigate = useNavigate();

    async function runLogin(username, password) {
        const response = await fetch("/api/auth/tokens", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username: username.trim(),
                password,
            }),
        });
        if (!response.ok) {
            if (response.status === 401) return {error: "Incorrect username or password."};
            if (response.status === 400) return {error: "Missing username or password."};
            return {
                error: `Login failed (HTTP ${response.status})`
            };
        }
        const data = await response.json();
        return {token: data.token};
    }

    async function runRegister(username, email, password) {
        const response = await fetch("/api/users", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username: username.trim(),
                email: email.trim(),
                password,
            }),
        });

        if (!response.ok) {
            if (response.status === 409) return {error: "That username is already taken."};
            if (response.status === 400) return {error: "Missing username, email, or password."};
            return {
                error: `Registration failed (HTTP ${response.status})`
            };
        }
        const data = await response.json();
        return {token: data.token};
    }

    const usernameInputId = React.useId();
    const passwordInputId = React.useId();
    const emailInputId = React.useId();

    async function handleSubmit(_prevResult, formData) {
        const username = formData.get("username");
        const password = formData.get("password");
        const email = formData.get("email");

        if (typeof username !== "string" || typeof password !== "string") {
            return "Please enter a username and password";
        }
        if (isRegistering && typeof email !== "string") {
            return "Please enter a valid email address";
        }

        try {
            const result = isRegistering
                ? await runRegister(username, email, password)
                : await runLogin(username, password);

            if (result.error) return result.error;

            onAuthToken?.(result.token);
            navigate("/");
            return "";
        } catch (e) {
            return e instanceof Error
                ? `Network error: ${e.message}`
                : `Network error: ${String(e)}`;
        }
    }

    const [result, formAction, isPending] = useActionState(handleSubmit, "");

    return (
        <>
            <h2>{isRegistering ? "Register a new account" : "Login"}</h2>

            <form className="LoginPage-form" action={formAction}>
                <label htmlFor={usernameInputId}>Username</label>
                <input
                    id={usernameInputId}
                    name="username"
                    required
                    disabled={isPending}
                />

                {isRegistering && (
                    <>
                        <label htmlFor={emailInputId}>Email</label>
                        <input
                            id={emailInputId}
                            name="email"
                            type="email"
                            required
                            disabled={isPending}
                        />
                    </>
                )}

                <label htmlFor={passwordInputId}>Password</label>
                <input
                    id={passwordInputId}
                    name="password"
                    type="password"
                    required
                    disabled={isPending}
                />

                <input type="submit" value={isPending ? "Submitting..." : "Submit"} disabled={isPending}/>

                <div aria-live="polite">
                    {result && <p className="LoginPage-error">{result}</p>}
                </div>
            </form>
            {isRegistering ? (
                <p>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            ) : (
                <p>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            )
            }
        </>
    );
}
