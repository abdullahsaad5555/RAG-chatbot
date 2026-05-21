from fastapi import FastAPI


app = FastAPI()


@app.post('/query')
def create_response():
    return {'response':'Hi, the bot has replied'}
