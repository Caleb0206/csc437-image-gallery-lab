import { MongoClient } from "mongodb";
import { getEnvVar } from "./getEnvVar.js";

export class ImageProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        const imagesCollectionName = getEnvVar("IMAGES_COLLECTION_NAME");
        this.imagesCollection = this.mongoClient.db().collection(imagesCollectionName);

        this.usersCollectionName = getEnvVar("USERS_COLLECTION_NAME");
    }

    getAllImages() {

        const pipeline = [];

        pipeline.push({
            $lookup: {
                from: this.usersCollectionName,
                localField: "authorId",
                foreignField: "username",
                as: "author",
            },
        });

        pipeline.push({
            $set: {
                author: { $first: "$author" },
            },
        });

        pipeline.push({
            $unset: ["authorId"]
        });


        return this.imagesCollection.aggregate(pipeline).toArray();

    }
}