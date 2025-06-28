import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const TABLE_NAME = process.env.DYNAMODB_TABLE;

export async function recordTransaction({ transactionID, email, programName, purchaseTimestamp }) {
    const params = {
        TableName: TABLE_NAME,
        Item: {
            transactionID: { S: transactionID },
            email: { S: email },
            programName: { S: programName },
            purchaseTimestamp: { S: purchaseTimestamp },
        },
    };

    try {
        await dynamoDbClient.send(new PutItemCommand(params));
    } catch (error) {
        console.error('Error recording transaction:', error);
        throw new Error('Could not record transaction.');
    }
}
