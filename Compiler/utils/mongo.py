from pymongo import MongoClient
from langgraph.checkpoint.mongodb import MongoDBSaver

def get_mongo_checkpointer(mongo_uri):
    client = MongoClient(mongo_uri)
    return client, MongoDBSaver(client)
