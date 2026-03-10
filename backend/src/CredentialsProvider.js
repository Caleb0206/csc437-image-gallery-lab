import bcrypt from "bcrypt"
import { getEnvVar } from "./getEnvVar.js"

export class CredentialsProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;

        const credsCollectionName = getEnvVar("CREDS_COLLECTION_NAME")
        this.credsCollection = this.mongoClient.db().collection(credsCollectionName)

        const usersCollectionName = getEnvVar("USERS_COLLECTION_NAME")
        this.usersCollection = this.mongoClient.db().collection(usersCollectionName)
    }

    async registerUser(username, email, password) {
        const existing = await this.credsCollection.findOne({ username });
        if (existing) return false;

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        await this.credsCollection.insertOne({
            username,
            password: passwordHash,
        });

        await this.usersCollection.insertOne({
            username,
            email,
        });

        return true;
    }

    async verifyPassword(username, plaintextPassword) {
        const creds = await this.credsCollection.findOne({ username });
        if (!creds) return false;
        return await bcrypt.compare(plaintextPassword, creds.password);
    }
}