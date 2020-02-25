'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient({
    api_version: '2012-08-10',
    region: process.env.REGION
});

module.exports.addRule = async (event, context) => {

  let parsedJSON = JSON.parse(event.body);

  const { ruleType, typeId, ruleName } = parsedJSON;

  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      ruleType, typeId, ruleName
    },
  };

  console.log(params);

  return await new Promise((resolve, reject) => {
    dynamoDb.put(params, (err, data) => {
      if (err) {
        console.log('ERROR', err);
        resolve({
          statusCode: 400,
          error: `Could not add rule: ${err}`
        });
      } else {
        console.log('SUCCESS', data);
        resolve({
          statusCode: 200,
          body: JSON.stringify(params.Item)
        });
      }
    });
  });

};

module.exports.getRule = async (event, context) => {
  console.log(event.pathParameters);

  if (!event.pathParameters) {
    return {
      statusCode: 404,
      error: 'No pathParameters'
    };
  }

  const params = {
    TableName: process.env.TABLE_NAME,
    IndexName: "typeId",
    ProgressionExpression: "ruleName",
    KeyConditionExpression: "typeId = :typeId",
    FilterExpression: "ruleType = :ruleType",
    ExpressionAttributeValues: {
      ":typeId": event.pathParameters.typeId,
      ":ruleType": event.pathParameters.ruleType
    }
  };

  return await new Promise((resolve, reject) => {
    dynamoDb.query(params, (err, data) => {
      if (err) {
        console.log('ERROR', err);
        resolve({
          statusCode: 400,
          error: `Could not query with ruleType: ${event.pathParameters.ruleType} and typeId: ${event.pathParameters.typeId}`
        });
      } else {
        console.log('SUCCESS', JSON.stringify(data.Items));
        resolve({ 
          statusCode: 200,
          body: JSON.stringify(data.Items)
        });
      }
    })
  })
}
