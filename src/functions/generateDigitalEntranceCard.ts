const { uuid } = require('uuidv4');
import { APIGatewayProxyHandler } from 'aws-lambda';
import { document } from '../utils/dynamodbClient';

interface ICreateDigitalEntranceCard {
  userName: string;
  userJob: string;
  userId: string;
  userDocument: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { userId, userDocument, userJob, userName } = JSON.parse(
    event.body
  ) as ICreateDigitalEntranceCard;

  const existsDigitalCard = await validIfUserAlreadyHasDigitalEntranceCard(
    userId
  );
  if (existsDigitalCard) {
    return existsDigitalCard.existsDigitalCardResponse;
  }

  const digitalEntranceCardId = uuid();

  await document
    .put({
      TableName: 'digital_entrance_card',
      Item: {
        id: digitalEntranceCardId,
        userId,
        userDocument,
        userJob,
        userName,
        created_at: new Date().getTime(),
      },
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `digital card generated to user ${userId} with pass id: ${digitalEntranceCardId}`,
    }),
  };
};

const validIfUserAlreadyHasDigitalEntranceCard = async (userId: string) => {
  const response = await document
    .query({
      TableName: 'digital_entrance_card',
      KeyConditionExpression: 'userId= :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    })
    .promise();
  if (response.Items[0]) {
    return {
      existsDigitalCardResponse: {
        statusCode: 400,
        body: JSON.stringify({
          message: `user ${userId} already has pass`,
        }),
      },
    };
  }
};
