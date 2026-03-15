import {MongoClient} from "mongodb";
import {getEnvVar} from "./getEnvVar.js";
import {ObjectId} from "mongodb";

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
                author: {$first: "$author"},
            },
        });

        pipeline.push({
            $unset: ["authorId"]
        });
        return this.imagesCollection.aggregate(pipeline).toArray();
    }

    async getOneImage(imageId) {
        if (!ObjectId.isValid(imageId)) {
            return null;
        }
        const pipeline = [];

        pipeline.push({$match: {_id: new ObjectId(imageId)}});
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
                author: {$first: "$author"},
            }
        });

        const results = await this.imagesCollection.aggregate(pipeline).toArray();
        return results[0] ?? null;

    }

    async updateImageName(imageId, newName) {
        const result = await this.imagesCollection.updateOne(
            {_id: new ObjectId(imageId)},
            {$set: {name: newName}}
        )
        return result.matchedCount;
    }

    async getImageOwnerUsername(imageId) {
        if (!ObjectId.isValid(imageId)) {
            return null;
        }
        const doc = await this.imagesCollection.findOne(
            {_id: new ObjectId(imageId)},
            {projection: {authorId: 1}}
        );
        return doc?.authorId ?? null;
    }

    async createImage(src, name, authorId) {
        const result = await this.imagesCollection.insertOne({
            src,
            name,
            authorId,
        });
        return result.insertedId;
    }
}