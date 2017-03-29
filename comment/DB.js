/**
 * Created by xiaos on 17/3/29.
 */
const mongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:11000/weibo';

let client = null;
async function get_client() {
    if(client) return client;
    try{
        client = await mongoClient.connect(url, config);
        return client;
    }catch (e){
        logger.error(`MongoClient connect fail,err = ${e.message} ,mongo_client_url = ${url}`);
    }
}

module.exports.get_client = get_client;

