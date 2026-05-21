from fastapi import FastAPI


app = FastAPI()


@app.post('/chat')
def create_response():
